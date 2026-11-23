"use client";

import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Implements requirement FR-09 and TC-009:
 * "نافذة تأكيد قبل تسجيل الخروج تضم خيارين (Logout / No) مع رسالة: Are you sure you want to logout?"
 */
export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Logout" maxWidth="sm">
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-800 dark:text-amber-300">
          <LogOut className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm font-semibold">
            Are you sure you want to logout?
          </p>
        </div>

        <p className="text-xs text-muted">
          Logging out will end your current active session on this device.
        </p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-card-border">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="min-w-20 font-semibold"
          >
            No
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={onConfirm}
            className="min-w-24 font-semibold"
          >
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
}
