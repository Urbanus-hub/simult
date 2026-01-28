"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  IconPlus,
  IconCheck,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your personal action items.
          </p>
        </div>
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="todo">To Do</TabsTrigger>
          <TabsTrigger value="inprogress">In Progress</TabsTrigger>
          <TabsTrigger value="done">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">TSK-123</TableCell>
                  <TableCell>Update API Documentation</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 hover:bg-yellow-100/80"
                    >
                      Medium
                    </Badge>
                  </TableCell>
                  <TableCell>Backend Architecture</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <IconClock className="h-4 w-4 text-blue-500" />
                      <span>In Progress</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">Tomorrow</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TSK-128</TableCell>
                  <TableCell>Fix login responsiveness</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 hover:bg-red-100/80"
                    >
                      High
                    </Badge>
                  </TableCell>
                  <TableCell>Design System</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-zinc-300" />
                      <span>To Do</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">Oct 30</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground line-through">
                    TSK-110
                  </TableCell>
                  <TableCell className="text-muted-foreground line-through">
                    Setup MongoDB Cluster
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Low</Badge>
                  </TableCell>
                  <TableCell>DevOps</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <IconCheck className="h-4 w-4" />
                      <span>Done</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    Yesterday
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        {/* Placeholder for other tabs */}
        <TabsContent value="todo">
          <div className="p-8 text-center text-muted-foreground">
            Filtering not implemented in preview.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
