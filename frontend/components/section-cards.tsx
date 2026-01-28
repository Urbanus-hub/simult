import {
  IconTrendingDown,
  IconTrendingUp,
  IconUsersGroup,
  IconListCheck,
  IconMessageCircle,
  IconActivity,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm border-0 bg-muted/40">
        <CardHeader className="pb-2">
          <CardDescription>Active Rooms</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconUsersGroup className="mr-1 size-3" />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Project Alpha <IconTrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="text-muted-foreground">Latest activity: 2m ago</div>
        </CardFooter>
      </Card>

      <Card className="shadow-sm border-0 bg-muted/40">
        <CardHeader className="pb-2">
          <CardDescription>Pending Tasks</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-amber-500">
              <IconListCheck className="mr-1 size-3" />
              Due Soon
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Frontend UI fix <IconTrendingUp className="size-4 text-amber-500" />
          </div>
          <div className="text-muted-foreground">3 high priority tasks</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Unread Messages</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconMessageCircle className="mr-1 size-3" />
              New
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            From Alice & Bob
          </div>
          <div className="text-muted-foreground">In 2 different rooms</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Online Team</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            5/12
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-emerald-500">
              <IconActivity className="mr-1 size-3" />
              Online
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Dev Team Sync
          </div>
          <div className="text-muted-foreground">Most active in #general</div>
        </CardFooter>
      </Card>
    </div>
  );
}
