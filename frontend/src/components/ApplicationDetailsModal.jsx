import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ApplicationDetailsModal({ open, onClose, application }) {
  if (!application) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl w-full max-w-xl shadow-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
          >
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Application Details</h2>
              <button onClick={onClose}><X /></button>
            </div>

            <div className="space-y-2">
              <p><strong>Name:</strong> {application.FullName}</p>
              <p><strong>Email:</strong> {application.Email}</p>
              <p><strong>Phone:</strong> {application.PhoneNumber}</p>
              <p><strong>City:</strong> {application.City}</p>
              <p><strong>Status:</strong> {application.Status}</p>

              <p><strong>Cover Letter:</strong></p>
              <div className="p-3 bg-gray-100 rounded-md">
                {application.CoverLetter || "No cover letter"}
              </div>

              <p><strong>Resume:</strong></p>
              {application.ResumeURL ? (
                <a
                  href={application.ResumeURL}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  View Resume (PDF/DOC)
                </a>
              ) : (
                "No resume uploaded"
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
