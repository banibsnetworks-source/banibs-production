import React from "react";

/**
 * ComingSoonV2 - Reusable placeholder component for future features
 * Uses BANIBS UI v2.0 design system
 */
export default function ComingSoonV2({ 
  title = "Coming soon", 
  body = "This feature is under development.", 
  actionLabel = "Back to home",
  onActionClick 
}) {
  return (
    <div className="container-v2 page-enter">
      <section className="section-v2">
        <div className="empty-state-v2">
          <div className="empty-state-icon">
            🚧
          </div>
          <h2 className="empty-state-title">{title}</h2>
          <p className="empty-state-description">{body}</p>
          {onActionClick && (
            <button 
              onClick={onActionClick}
              className="btn-v2 btn-v2-ghost btn-v2-md"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
