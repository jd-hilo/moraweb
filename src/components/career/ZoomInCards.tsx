import { useState } from 'react';
import { X } from 'lucide-react';
import { ZoomIns } from '../../types/career';

interface Props {
  zoomIns: ZoomIns;
}

export function ZoomInCards({ zoomIns }: Props) {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const cards = zoomIns.cards || [
    { id: 'tuesday', title: 'A Random Tuesday', icon: '📱' },
    { id: 'email', title: 'The Email That Changed Everything', icon: '📧' },
    { id: 'calendar', title: 'Your Calendar Evolution', icon: '📅' },
    { id: 'feedback', title: 'What Your Team Says About You', icon: '💬' },
    { id: 'inbox', title: 'Your Inbox: Then vs Now', icon: '📬' },
  ];

  return (
    <>
      {/* Horizontal scroll of cards */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
        <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => setActiveCard(card.id)}
              className="flex-shrink-0 w-40 h-48 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition-all hover:scale-105 flex flex-col items-center justify-center gap-3 p-4 text-center"
            >
              <span className="text-4xl">{card.icon}</span>
              <span className="text-sm font-semibold text-gray-800 leading-tight">{card.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {activeCard && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center"
          onClick={() => setActiveCard(null)}
        >
          <div
            className="bg-white w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl md:rounded-3xl p-6 md:p-8 relative animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {activeCard === 'tuesday' && <RandomTuesdayModal data={zoomIns.randomTuesday} />}
            {activeCard === 'email' && <EmailModal data={zoomIns.theEmail} />}
            {activeCard === 'calendar' && <CalendarModal data={zoomIns.calendar} />}
            {activeCard === 'feedback' && <FeedbackModal data={zoomIns.teamFeedback} />}
            {activeCard === 'inbox' && <InboxModal data={zoomIns.inbox} />}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}

function RandomTuesdayModal({ data }: { data: ZoomIns['randomTuesday'] }) {
  if (!data) return <p className="text-gray-400">No data available</p>;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">📱 A Random Tuesday</p>
        <h3 className="text-xl font-bold text-black">{data.date}</h3>
      </div>

      {/* Notifications */}
      {data.notifications?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Notifications</p>
          <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
            {data.notifications.map((n, i) => (
              <div key={i} className="flex items-start gap-3 p-2 bg-white rounded-xl">
                <span className="text-lg flex-shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold text-gray-800">{n.app}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-700">{n.title}</p>
                  <p className="text-xs text-gray-500 truncate">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {data.timeline?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">Your Day</p>
          <div className="space-y-3">
            {data.timeline.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <span className="text-lg">{item.icon}</span>
                  {i < data.timeline.length - 1 && (
                    <div className="w-0.5 h-6 bg-gray-200 mt-1" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-teal-600">{item.time}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {data.stats && (
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-black">{data.stats.decisionsMade}</p>
            <p className="text-xs text-gray-400">Decisions Made</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-black">{data.stats.imposterSyndromeMoments}</p>
            <p className="text-xs text-gray-400">Impostor Syndrome Moments</p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailModal({ data }: { data: ZoomIns['theEmail'] }) {
  if (!data) return <p className="text-gray-400">No data available</p>;
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider">📧 The Email That Changed Everything</p>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
        {/* Email header */}
        <div className="space-y-2 text-xs text-gray-500">
          <div><span className="font-semibold text-gray-700">From:</span> {data.from}</div>
          <div><span className="font-semibold text-gray-700">To:</span> {data.to}</div>
          <div><span className="font-semibold text-gray-700">Date:</span> {data.timestamp}</div>
        </div>

        <h3 className="text-lg font-bold text-black border-t border-gray-200 pt-3">
          {data.subject}
        </h3>

        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {data.body}
        </div>
      </div>

      {/* Metadata */}
      {data.metadata && (
        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
          <span>📁 {data.metadata.folder}</span>
          <span>👁 Opened {data.metadata.timesOpened} times</span>
          <span>⭐ {data.metadata.lastUpdate}</span>
        </div>
      )}
    </div>
  );
}

function CalendarModal({ data }: { data: ZoomIns['calendar'] }) {
  if (!data) return <p className="text-gray-400">No data available</p>;

  const renderWeek = (view: typeof data.current, label: string) => (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-500 mb-2">{label} ({view.year})</p>
      <div className="space-y-1.5">
        {view.events?.slice(0, 6).map((evt, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-1 h-4 rounded-full" style={{ backgroundColor: evt.color }} />
            <span className="text-gray-400 w-8 flex-shrink-0">{evt.day}</span>
            <span className="text-gray-400 w-14 flex-shrink-0">{evt.time}</span>
            <span className="text-gray-700 truncate">{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-400 uppercase tracking-wider">📅 Your Calendar Evolution</p>

      <div className="flex gap-4">
        {renderWeek(data.current, 'Now')}
        {renderWeek(data.future, 'Future')}
      </div>

      {data.stats && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Meetings/Week</p>
            <p className="text-sm font-bold text-black">{data.stats.meetingsPerWeek.current} → {data.stats.meetingsPerWeek.future}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Stress Level</p>
            <p className="text-sm font-bold text-black">{data.stats.stressLevel.current} → {data.stats.stressLevel.future}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Control Level</p>
            <p className="text-sm font-bold text-black">{data.stats.controlLevel.current} → {data.stats.controlLevel.future}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Last Opened Figma</p>
            <p className="text-sm font-bold text-black">{data.stats.lastOpenedFigma.current} → {data.stats.lastOpenedFigma.future}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackModal({ data }: { data: ZoomIns['teamFeedback'] }) {
  if (!data) return <p className="text-gray-400">No data available</p>;
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider">💬 What Your Team Says About You</p>

      <div className="space-y-4">
        {data.messages?.map((msg, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{msg.avatar}</span>
              <span className="text-sm font-semibold text-gray-800">{msg.author}</span>
              <span className="text-xs text-gray-400 ml-auto">{msg.timestamp}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-8">{msg.message}</p>
            {msg.reactions?.length > 0 && (
              <div className="flex gap-2 pl-8">
                {msg.reactions.map((r, ri) => (
                  <span key={ri} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                    {r.emoji} {r.count}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {data.finalMessage && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 italic">{data.finalMessage}</p>
        </div>
      )}
    </div>
  );
}

function InboxModal({ data }: { data: ZoomIns['inbox'] }) {
  if (!data) return <p className="text-gray-400">No data available</p>;

  const renderInbox = (view: typeof data.current, label: string) => (
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-gray-500 mb-2">{label} ({view.year})</p>
      <div className="space-y-1.5">
        {view.emails?.slice(0, 5).map((email, i) => (
          <div key={i} className={`flex items-start gap-2 text-xs p-1.5 rounded-lg ${email.unread ? 'bg-blue-50' : ''}`}>
            <div className="flex-shrink-0 mt-0.5">
              {email.important && <span className="text-yellow-500">★</span>}
              {email.unread && !email.important && <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />}
            </div>
            <div className="min-w-0">
              <p className={`truncate ${email.unread ? 'font-bold text-gray-800' : 'text-gray-600'}`}>{email.sender}</p>
              <p className="text-gray-500 truncate">{email.subject}</p>
            </div>
            <span className="text-gray-400 flex-shrink-0">{email.time}</span>
          </div>
        ))}
        {view.filteredCount && (
          <p className="text-xs text-gray-400 text-center pt-1">+{view.filteredCount} filtered</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-400 uppercase tracking-wider">📬 Your Inbox: Then vs Now</p>

      <div className="flex gap-4">
        {renderInbox(data.current, 'Now')}
        {renderInbox(data.future, 'Future')}
      </div>

      {data.stats && (
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Response Time</p>
            <p className="text-sm font-bold text-black">{data.stats.responseTime.current} → {data.stats.responseTime.future}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Stress Level</p>
            <p className="text-sm font-bold text-black">{data.stats.stressLevel.current} → {data.stats.stressLevel.future}</p>
          </div>
        </div>
      )}
    </div>
  );
}
