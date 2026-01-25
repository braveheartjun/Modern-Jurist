import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface User {
  id: string;
  name: string;
  color: string;
}

interface ActiveUser {
  socketId: string;
  user: User;
}

interface DocumentUpdate {
  content: string;
  userId: string;
  timestamp: number;
}

export function useCollaboration(documentId: string, currentUser: User) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize Socket.io connection
    const socketInstance = io({
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("[Collaboration] Connected to server");
      setIsConnected(true);
      
      // Join the document session
      socketInstance.emit("join-document", {
        documentId,
        user: currentUser,
      });
    });

    socketInstance.on("disconnect", () => {
      console.log("[Collaboration] Disconnected from server");
      setIsConnected(false);
    });

    // Handle room users list
    socketInstance.on("room-users", (users: ActiveUser[]) => {
      setActiveUsers(users);
    });

    // Handle user joined
    socketInstance.on("user-joined", ({ user, socketId }: { user: User; socketId: string }) => {
      setActiveUsers(prev => [...prev, { socketId, user }]);
    });

    // Handle user left
    socketInstance.on("user-left", ({ socketId }: { socketId: string }) => {
      setActiveUsers(prev => prev.filter(u => u.socketId !== socketId));
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.emit("leave-document", documentId);
        socketInstance.disconnect();
      }
    };
  }, [documentId, currentUser]);

  const sendEdit = useCallback(
    (content: string) => {
      if (socket && isConnected) {
        socket.emit("document-edit", {
          documentId,
          content,
          userId: currentUser.id,
          timestamp: Date.now(),
        });
      }
    },
    [socket, isConnected, documentId, currentUser.id]
  );

  const onDocumentUpdate = useCallback((callback: (update: DocumentUpdate) => void) => {
    if (socket) {
      socket.on("document-update", callback);
      return () => {
        socket.off("document-update", callback);
      };
    }
  }, [socket]);

  return {
    isConnected,
    activeUsers,
    sendEdit,
    onDocumentUpdate,
  };
}
