import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Activity, Network, MessageSquare, GitBranch } from "lucide-react"
import Link from "next/link"
import { getSampleStats } from "@/lib/sample-data"

export default function Dashboard() {
  const stats = getSampleStats()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DeepROS Platform</h1>
          <p className="text-xl text-gray-600">Comprehensive ROS Domain Management System</p>
          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full inline-block">
            🚀 Demo Mode - Using Sample Data
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Domains</CardTitle>
              <Network className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDomains}</div>
              <p className="text-xs text-muted-foreground">{stats.domains} total domains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Nodes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeNodes}</div>
              <p className="text-xs text-muted-foreground">{stats.nodes} total nodes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">{stats.connections} total connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.messages}</div>
              <p className="text-xs text-muted-foreground">Sample message data</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ROS Domains</CardTitle>
              <CardDescription>Manage your ROS domains and agents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create, modify, and monitor ROS domains with their respective node agents.
              </p>
              <Link href="/domains">
                <Button className="w-full">Manage Domains</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Node Management</CardTitle>
              <CardDescription>Control nodes across all domains</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Manage Topics, Services, and Actions within your ROS domains.
              </p>
              <Link href="/nodes">
                <Button className="w-full">Manage Nodes</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Graph</CardTitle>
              <CardDescription>Visualize node interconnections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Interactive graph showing connections between nodes across domains.
              </p>
              <Link href="/graph">
                <Button className="w-full">View Graph</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Viewer</CardTitle>
              <CardDescription>Monitor real-time communications</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Inspect messages exchanged between nodes in real-time.</p>
              <Link href="/messages">
                <Button className="w-full">View Messages</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connections</CardTitle>
              <CardDescription>Manage node connections</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Create and manage connections between nodes, even across domains.
              </p>
              <Link href="/connections">
                <Button className="w-full">Manage Connections</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Monitor platform health</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                View system status, performance metrics, and health indicators.
              </p>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
