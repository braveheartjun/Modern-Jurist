import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCollaboration } from "@/hooks/useCollaboration";
import { Wifi, WifiOff } from "lucide-react";

interface CollaborativeEditorProps {
  value: string;
  onChange: (value: string) => void;
  documentId: string;
  currentUser: {
    id: string;
    name: string;
    color: string;
  };
  placeholder?: string;
  className?: string;
}

export function CollaborativeEditor({
  value,
  onChange,
  documentId,
  currentUser,
  placeholder,
  className,
}: CollaborativeEditorProps) {
  const { isConnected, activeUsers, sendEdit, onDocumentUpdate } = useCollaboration(
    documentId,
    currentUser
  );
  const [localValue, setLocalValue] = useState(value);

  // Sync external changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Listen for remote updates
  useEffect(() => {
    const cleanup = onDocumentUpdate?.((update) => {
      setLocalValue(update.content);
      onChange(update.content);
    });
    return cleanup;
  }, [onDocumentUpdate, onChange]);

  const handleChange = (newValue: string) => {
    setLocalValue(newValue);
    onChange(newValue);
    sendEdit(newValue);
  };

  return (
    <div className="space-y-3">
      {/* Presence Bar */}
      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
          {activeUsers.length > 0 && (
            <>
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground">
                {activeUsers.length} {activeUsers.length === 1 ? "user" : "users"} editing
              </span>
            </>
          )}
        </div>

        {/* Active Users Avatars */}
        <div className="flex items-center gap-1">
          {activeUsers.map((activeUser) => (
            <Tooltip key={activeUser.socketId}>
              <TooltipTrigger>
                <Avatar className="h-7 w-7 border-2" style={{ borderColor: activeUser.user.color }}>
                  <AvatarFallback
                    className="text-xs font-semibold"
                    style={{
                      backgroundColor: `${activeUser.user.color}20`,
                      color: activeUser.user.color,
                    }}
                  >
                    {activeUser.user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{activeUser.user.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {/* Current User */}
          <Tooltip>
            <TooltipTrigger>
              <Avatar className="h-7 w-7 border-2" style={{ borderColor: currentUser.color }}>
                <AvatarFallback
                  className="text-xs font-semibold"
                  style={{
                    backgroundColor: `${currentUser.color}20`,
                    color: currentUser.color,
                  }}
                >
                  {currentUser.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{currentUser.name} (You)</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Editor */}
      <Textarea
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
    </div>
  );
}
