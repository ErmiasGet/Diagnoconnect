import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send, Search, MessageSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { chatService } from "../../lib/api";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { getInitials } from "../../lib/utils";
import type { ChatRoom, ChatMessage } from "../../types";

export function ChatPage() {
  const { user } = useAuth();
  const { on, emit } = useSocket();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: () => chatService.getRooms(),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat-messages", selectedRoom?.id],
    queryFn: () => chatService.getMessages(selectedRoom!.id, { limit: 50 }),
    enabled: !!selectedRoom,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => chatService.sendMessage(selectedRoom!.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedRoom?.id] });
      queryClient.invalidateQueries({ queryKey: ["chat-rooms"] });
    },
  });

  useEffect(() => {
    if (!selectedRoom) return;
    const cleanup = on("new-message", (msg: unknown) => {
      const message = msg as ChatMessage;
      if (message.roomId === selectedRoom.id) {
        queryClient.invalidateQueries({ queryKey: ["chat-messages", selectedRoom.id] });
      }
    });
    return cleanup;
  }, [selectedRoom, on, queryClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const handleSend = () => {
    if (!message.trim() || !selectedRoom) return;
    sendMessageMutation.mutate(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout title="Chat">
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search conversations..." className="pl-10" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {roomsLoading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg p-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rooms?.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {rooms?.map((room: ChatRoom) => {
                  const doctor = room.doctor;
                  const isActive = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/30"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={doctor?.profileImage} />
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(doctor?.firstName || "D", doctor?.lastName || "R")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          Dr. {doctor?.firstName} {doctor?.lastName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {room.lastMessage?.content || "Start a conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedRoom ? (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedRoom.doctor?.profileImage} />
                  <AvatarFallback className="bg-blue-100 text-blue-700">
                    {getInitials(selectedRoom.doctor?.firstName || "D", selectedRoom.doctor?.lastName || "R")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Dr. {selectedRoom.doctor?.firstName} {selectedRoom.doctor?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{selectedRoom.doctor?.specialization}</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                        <Skeleton className={`h-10 w-48 rounded-2xl ${i % 2 === 0 ? "bg-blue-100" : ""}`} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messagesData?.data?.map((msg: ChatMessage) => {
                      const isOwn = msg.senderId === user?.id;
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
                              {format(new Date(msg.createdAt), "h:mm a")}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  Select a conversation
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a doctor to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
