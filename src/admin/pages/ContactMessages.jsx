import { useEffect, useState } from "react";
import API_BASE_URL from "../../config/api";
import "./ContactMessages.css";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  /* ================= LOAD ================= */

  const loadMessages = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/contact_messages_list.php`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setMessages(data.data || []);
      } else {
        setMessage(data.message || "Message list load করা যায়নি");
      }
    } catch (error) {
      console.error("Contact messages load error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  /* ================= REPLY ================= */

  const openReply = (item) => {
    setReplyTarget(item);
    setReplyText(item.reply_message || "");
  };

  const closeReply = () => {
    if (sending) return;
    setReplyTarget(null);
    setReplyText("");
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyTarget || !replyText.trim()) return;

    setSending(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/contact_message_reply.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: replyTarget.id,
            reply_message: replyText.trim(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage("Reply সফলভাবে সংরক্ষণ হয়েছে");
        setReplyTarget(null);
        setReplyText("");
        loadMessages();
      } else {
        setMessage(data.message || "Reply পাঠানো যায়নি");
      }
    } catch (error) {
      console.error("Reply send error:", error);
      setMessage("Server-এর সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-messages-page">
      <div className="contact-messages-header">
        <div>
          <h1>Contact Messages</h1>
          <p>Website Contact ফর্ম থেকে আসা সকল বার্তা</p>
        </div>

        <button type="button" className="refresh-btn" onClick={loadMessages} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && <div className="contact-messages-message">{message}</div>}

      {loading ? (
        <div className="contact-messages-loading">তথ্য লোড হচ্ছে...</div>
      ) : messages.length === 0 ? (
        <div className="empty-contact-messages">কোনো message পাওয়া যায়নি।</div>
      ) : (
        <div className="contact-messages-table-wrap">
          <table className="contact-messages-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>Message</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {messages.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.mobile}</td>
                  <td>{item.email || "—"}</td>
                  <td className="message-cell">{item.message}</td>
                  <td>{item.branch_name || "—"}</td>
                  <td>
                    <span className={`status-badge status-${item.status || "new"}`}>
                      {item.status || "new"}
                    </span>
                  </td>
                  <td>{String(item.created_at || "").slice(0, 16)}</td>
                  <td>
                    <button type="button" className="reply-btn" onClick={() => openReply(item)}>
                      ↩️ Reply
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {replyTarget && (
        <div className="contact-modal-overlay" onMouseDown={closeReply}>
          <div className="contact-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <h2>Reply to {replyTarget.name}</h2>
              <button type="button" className="modal-close" onClick={closeReply}>
                ✕
              </button>
            </div>

            <p className="original-message">
              <strong>Message:</strong> {replyTarget.message}
            </p>

            <form onSubmit={handleReplySubmit} className="reply-form">
              <textarea
                rows="6"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="আপনার reply লিখুন..."
                required
              />

              <div className="reply-modal-actions">
                <button type="button" className="cancel-btn" onClick={closeReply} disabled={sending}>
                  Cancel
                </button>
                <button type="submit" className="send-reply-btn" disabled={sending}>
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
