import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/common/Layout";
import MetaTags from "@/components/common/MetaTags";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { Eye, Search } from "lucide-react";

// Simple password check
const ADMIN_PASSWORD = "qzonmeadmin123"; // You can change this password

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  read?: boolean;
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [viewedMessages, setViewedMessages] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Load viewed messages from localStorage
  useEffect(() => {
    const savedViewed = localStorage.getItem("viewedMessages");
    if (savedViewed) {
      setViewedMessages(new Set(JSON.parse(savedViewed)));
    }
  }, []);

  // Save viewed messages to localStorage
  useEffect(() => {
    if (viewedMessages.size > 0) {
      localStorage.setItem("viewedMessages", JSON.stringify(Array.from(viewedMessages)));
    }
  }, [viewedMessages]);

  const { data, isLoading, error } = useQuery<{success: boolean, messages: ContactMessage[]}>({
    queryKey: ["/api/contact/messages"],
    queryFn: async () => {
      if (!isAuthenticated) return {success: true, messages: []};
      const response = await fetch("/api/contact/messages");
      if (!response.ok) {
        throw new Error("Failed to fetch contact messages");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });
  
  // Extract messages from the response
  const contactMessages = data?.messages || [];

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const markAsViewed = (id: string) => {
    setViewedMessages(prev => {
      const updated = new Set(prev);
      updated.add(id);
      return updated;
    });
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    markAsViewed(message.id);
  };

  const handleClearViewed = () => {
    setViewedMessages(new Set());
    localStorage.removeItem("viewedMessages");
    toast({
      title: "Cleared",
      description: "All messages are now marked as unread",
    });
  };

  const filteredMessages = contactMessages?.filter(message => 
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadMessages = filteredMessages?.filter(
    message => !viewedMessages.has(message.id)
  );

  const readMessages = filteredMessages?.filter(
    message => viewedMessages.has(message.id)
  );

  if (!isAuthenticated) {
    return (
      <Layout>
        <MetaTags
          title="Admin Panel | QzonMe"
          description="Admin panel for QzonMe website"
          type="website"
        />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Admin Login</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleLogin();
                      }
                    }}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleLogin}
                >
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <MetaTags
        title="Admin Panel | QzonMe"
        description="Admin panel for QzonMe website"
        type="website"
      />
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Contact Messages</span>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={handleClearViewed}
                size="sm"
              >
                Mark All As Unread
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center p-4">Loading messages...</div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">
              Error loading messages: {(error as Error).message}
            </div>
          ) : contactMessages && contactMessages.length > 0 ? (
            <Tabs defaultValue="unread">
              <TabsList className="mb-4">
                <TabsTrigger value="unread">
                  Unread {unreadMessages && unreadMessages.length > 0 && `(${unreadMessages.length})`}
                </TabsTrigger>
                <TabsTrigger value="read">
                  Read {readMessages && readMessages.length > 0 && `(${readMessages.length})`}
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({contactMessages.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="unread">
                <MessageTable 
                  messages={unreadMessages || []} 
                  onViewMessage={handleViewMessage}
                  viewedMessages={viewedMessages}
                />
              </TabsContent>
              
              <TabsContent value="read">
                <MessageTable 
                  messages={readMessages || []} 
                  onViewMessage={handleViewMessage}
                  viewedMessages={viewedMessages}
                />
              </TabsContent>
              
              <TabsContent value="all">
                <MessageTable 
                  messages={filteredMessages || []} 
                  onViewMessage={handleViewMessage}
                  viewedMessages={viewedMessages}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center p-4">No contact messages found.</div>
          )}
        </CardContent>
      </Card>

      {/* Message View Dialog */}
      {selectedMessage && (
        <AlertDialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <AlertDialogContent className="max-w-xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Message from {selectedMessage.name}</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <div>
                  <span className="font-semibold">From:</span> {selectedMessage.name} ({selectedMessage.email})
                </div>
                <div>
                  <span className="font-semibold">Sent:</span>{" "}
                  {new Date(selectedMessage.timestamp).toLocaleString()} (
                  {formatDistanceToNow(new Date(selectedMessage.timestamp), { addSuffix: true })})
                </div>
                <div className="mt-4 bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  onClick={() => {
                    // This would be where you'd send a reply if we had email integration
                    // but for now it just opens the mailto:
                    window.location.href = `mailto:${selectedMessage.email}?subject=Re: Your message to QzonMe&body=Hello ${selectedMessage.name},%0A%0AThank you for contacting us regarding:%0A%0A"${selectedMessage.message}"%0A%0A`;
                  }}
                >
                  Reply via Email
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Layout>
  );
};

interface MessageTableProps {
  messages: ContactMessage[];
  onViewMessage: (message: ContactMessage) => void;
  viewedMessages: Set<string>;
}

const MessageTable: React.FC<MessageTableProps> = ({ 
  messages, 
  onViewMessage,
  viewedMessages
}) => {
  if (messages.length === 0) {
    return <div className="text-center p-4">No messages found.</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">From</TableHead>
            <TableHead>Message</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[80px]">Status</TableHead>
            <TableHead className="w-[80px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {messages.map((message) => (
            <TableRow key={message.id}>
              <TableCell className="font-medium">
                <div>{message.name}</div>
                <div className="text-sm text-muted-foreground">{message.email}</div>
              </TableCell>
              <TableCell>
                <div className="line-clamp-2">{message.message}</div>
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
              </TableCell>
              <TableCell>
                {viewedMessages.has(message.id) ? (
                  <Badge variant="outline">Read</Badge>
                ) : (
                  <Badge>New</Badge>
                )}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onViewMessage(message)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Admin;