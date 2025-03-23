import React from 'react';

import {
  CheckCircleIcon,
  ClockIcon,
  CursorArrowRaysIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';

export interface TimelineEvent {
  id: string;
  contactId: string;
  type: 'email_sent' | 'email_opened' | 'link_clicked' | 'status_change' | 'flow_complete';
  timestamp: string;
  data: {
    emailId?: string;
    emailSubject?: string;
    linkUrl?: string;
    newStatus?: string;
    oldStatus?: string;
  };
}

interface ContactTimelineProps {
  events: TimelineEvent[];
  contactId: string;
}

export const ContactTimeline: React.FC<ContactTimelineProps> = ({
  events,
  contactId,
}) => {
  const filteredEvents = events
    .filter(event => event.contactId === contactId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
  };

  const renderEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'email_sent':
        return <EnvelopeIcon className="h-5 w-5 text-gray-400" />;
      case 'email_opened':
        return <EnvelopeOpenIcon className="h-5 w-5 text-green-400" />;
      case 'link_clicked':
        return <CursorArrowRaysIcon className="h-5 w-5 text-blue-400" />;
      case 'status_change':
        return <CheckCircleIcon className="h-5 w-5 text-yellow-400" />;
      case 'flow_complete':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const renderEventContent = (event: TimelineEvent) => {
    switch (event.type) {
      case 'email_sent':
        return (
          <>
            <span className="font-medium">Email sent</span>
            {event.data.emailSubject && (
              <span className="block text-sm text-gray-400">
                Subject: {event.data.emailSubject}
              </span>
            )}
          </>
        );
      case 'email_opened':
        return (
          <>
            <span className="font-medium">Email opened</span>
            {event.data.emailSubject && (
              <span className="block text-sm text-gray-400">
                Subject: {event.data.emailSubject}
              </span>
            )}
          </>
        );
      case 'link_clicked':
        return (
          <>
            <span className="font-medium">Link clicked</span>
            {event.data.linkUrl && (
              <span className="block text-sm text-gray-400 truncate max-w-xs">
                URL: {event.data.linkUrl}
              </span>
            )}
          </>
        );
      case 'status_change':
        return (
          <>
            <span className="font-medium">Status changed</span>
            {event.data.oldStatus && event.data.newStatus && (
              <span className="block text-sm text-gray-400">
                {event.data.oldStatus} → {event.data.newStatus}
              </span>
            )}
          </>
        );
      case 'flow_complete':
        return <span className="font-medium">Flow completed</span>;
      default:
        return <span className="font-medium">Unknown event</span>;
    }
  };

  return (
    <div className="bg-secondary-bg rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-medium text-white">Activity Timeline</h2>
      </div>

      <div className="p-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400">No activity recorded yet</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {filteredEvents.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== filteredEvents.length - 1 ? (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-700"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gray-800 flex items-center justify-center ring-8 ring-secondary-bg">
                          {renderEventIcon(event.type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm text-white">
                            {renderEventContent(event)}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {formatTimestamp(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 