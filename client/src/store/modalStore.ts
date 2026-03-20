import { create } from 'zustand';

export type ModalType = 'success' | 'error' | 'celebration' | 'info' | 'confirm';

interface ModalOptions {
  type: ModalType;
  title: string;
  message?: string;
  streak?: number;
  score?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface ModalState extends ModalOptions {
  isOpen: boolean;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  openModal: (options) => set({ ...options, isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
