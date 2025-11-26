// pages/admin/orchestration/components/EventHistory.jsx
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Search, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EVENT_COLORS = {
  STAGE_PROMOTION: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  STAGE_ROLLBACK: "bg-red-600/20 text-red-300 border-red-500/30",
  MODULE_BLOCKED: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  MODULE_UNBLOCKED: "bg-green-600/20 text-green-300 border-green-500/30",
};

export default function EventHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/orchestration/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        setError("Failed to fetch events");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const searchLower = searchTerm.toLowerCase();
    return (
      event.module_name?.toLowerCase().includes(searchLower) ||
      event.event_type?.toLowerCase().includes(searchLower) ||
      event.correlation_id?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={24} />
        <span className="ml-2 text-slate-400">Loading events...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input
            placeholder="Search events by module, type, or correlation ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400">
        Showing {filteredEvents.length} of {events.length} events
      </div>

      {/* Table */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-slate-300">Timestamp</TableHead>
              <TableHead className="text-slate-300">Module</TableHead>
              <TableHead className="text-slate-300">Event Type</TableHead>
              <TableHead className="text-slate-300">Stage Change</TableHead>
              <TableHead className="text-slate-300">Correlation ID</TableHead>
              <TableHead className="text-slate-300">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                  No events found
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="text-slate-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {formatDate(event.created_at)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-100">
                    {event.module_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={EVENT_COLORS[event.event_type] || "bg-slate-600/20 text-slate-300"}
                    >
                      {event.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm">
                    {event.from_stage && event.to_stage ? (
                      <span>
                        {event.from_stage} → {event.to_stage}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400 text-xs font-mono">
                    {event.correlation_id || "—"}
                  </TableCell>
                  <TableCell className="text-slate-400 text-sm max-w-md truncate">
                    {event.details || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
