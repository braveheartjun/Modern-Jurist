import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";

interface User {
  id: string;
  name: string;
  color: string;
}

interface DocumentEdit {
  documentId: string;
  content: string;
  userId: string;
  timestamp: number;
}

interface UserPresence {
  documentId: string;
  user: User;
}

const activeUsers = new Map<string, User>();
const documentSessions = new Map<string, Set<string>>();

export function setupSocketIO(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/api/socket.io",
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // Handle user joining a document session
    socket.on("join-document", (data: UserPresence) => {
      const { documentId, user } = data;
      
      // Store user info
      activeUsers.set(socket.id, user);
      
      // Add user to document session
      if (!documentSessions.has(documentId)) {
        documentSessions.set(documentId, new Set());
      }
      documentSessions.get(documentId)!.add(socket.id);
      
      // Join the document room
      socket.join(documentId);
      
      // Notify others in the room
      socket.to(documentId).emit("user-joined", { user, socketId: socket.id });
      
      // Send current users in the room to the new user
      const usersInRoom = Array.from(documentSessions.get(documentId) || [])
        .filter(id => id !== socket.id)
        .map(id => ({
          socketId: id,
          user: activeUsers.get(id),
        }))
        .filter(u => u.user);
      
      socket.emit("room-users", usersInRoom);
      
      console.log(`[Socket.io] User ${user.name} joined document ${documentId}`);
    });

    // Handle document edits
    socket.on("document-edit", (data: DocumentEdit) => {
      const { documentId, content, userId, timestamp } = data;
      
      // Broadcast to all users in the document room except sender
      socket.to(documentId).emit("document-update", {
        content,
        userId,
        timestamp,
      });
      
      console.log(`[Socket.io] Document ${documentId} edited by ${userId}`);
    });

    // Handle user leaving
    socket.on("leave-document", (documentId: string) => {
      handleUserLeave(socket.id, documentId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
      
      // Find all documents this user was in
      documentSessions.forEach((users, documentId) => {
        if (users.has(socket.id)) {
          handleUserLeave(socket.id, documentId);
        }
      });
      
      activeUsers.delete(socket.id);
    });
  });

  function handleUserLeave(socketId: string, documentId: string) {
    const user = activeUsers.get(socketId);
    
    if (documentSessions.has(documentId)) {
      documentSessions.get(documentId)!.delete(socketId);
      
      // Clean up empty sessions
      if (documentSessions.get(documentId)!.size === 0) {
        documentSessions.delete(documentId);
      }
    }
    
    // Notify others
    io.to(documentId).emit("user-left", { socketId, user });
    
    if (user) {
      console.log(`[Socket.io] User ${user.name} left document ${documentId}`);
    }
  }

  return io;
}
