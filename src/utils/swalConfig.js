// src/utils/swalConfig.js
import Swal from 'sweetalert2';

export const showSuccess = (title, text = '', timer = 3000) => {
  Swal.fire({
    icon: 'success',
    title,
    text,
    timer,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

export const showError = (title, text = '', timer = 4000) => {
  Swal.fire({
    icon: 'error',
    title,
    text,
    timer,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

export const showWarning = (title, text = '', timer = 3000) => {
  Swal.fire({
    icon: 'warning',
    title,
    text,
    timer,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

export const showLoading = (title = 'Cargando...') => {
  Swal.fire({
    title,
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });
};

export const closeSwal = () => {
  Swal.close();
};

export const showConfirm = (title, text, confirmText = 'Sí', cancelText = 'No') => {
  return Swal.fire({
    title,
    text,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33'
  });
};