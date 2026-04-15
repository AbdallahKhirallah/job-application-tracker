import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "applied",   label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer",     label: "Offer" },
  { id: "rejected",  label: "Rejected" },
];

export default function KanbanBoard({ applications, onStatusChange, onDelete, onDropToInterview }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const grouped = COLUMNS.reduce((acc, col) => {
    acc[col.id] = applications.filter((a) => a.status === col.id);
    return acc;
  }, {});

  function handleDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const appId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    if (newStatus === "interview") {
      onDropToInterview(appId);
    } else {
      onStatusChange(appId, { status: newStatus });
    }
  }

  return (
    <>
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="kanban-board">
        {COLUMNS.map((col) => (
          <div key={col.id} className="kanban-column">
            <div className={`kanban-column-header kanban-header-${col.id}`}>
              <span className={`kanban-dot kanban-dot-${col.id}`} />
              <span className="kanban-col-label">{col.label}</span>
              <span className="kanban-col-count">{grouped[col.id].length}</span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  className={`kanban-column-body ${snapshot.isDraggingOver ? "kanban-drop-active" : ""}`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {grouped[col.id].map((app, index) => (
                    <Draggable key={app.id} draggableId={String(app.id)} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`kanban-card kanban-card-${app.status} ${snapshot.isDragging ? "kanban-card-dragging" : ""}`}
                        >
                          <div className="kanban-card-top">
                            <span className="kanban-card-company">{app.company}</span>
                            <button
                              className="kanban-card-delete"
                              title="Delete"
                              onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(app.id); }}
                            >
                              ×
                            </button>
                          </div>
                          <span className="kanban-card-role">{app.role}</span>
                          {app.interview_date && app.status === "interview" && (
                            <span className="kanban-card-date">
                              {formatDate(app.interview_date)}
                            </span>
                          )}
                          {app.location && (
                            <span className="kanban-card-location">{app.location}</span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {grouped[col.id].length === 0 && !snapshot.isDraggingOver && (
                    <div className="kanban-empty-col">Drop here</div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>

      {confirmDeleteId !== null && (
        <div className="confirm-overlay" onClick={() => setConfirmDeleteId(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Delete application?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={() => { onDelete(confirmDeleteId); setConfirmDeleteId(null); }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      </>
  );
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
