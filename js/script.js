/* 웨딩 갤러리 팝업과 계좌 복사 알림을 관리하는 JavaScript입니다. */
'use strict';

// 페이지의 사진 버튼을 순서대로 불러옵니다.
const photoButtons = Array.from(document.querySelectorAll('[data-photo]'));
const photoModal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const photoCount = document.getElementById('photo-count');
const copyModal = document.getElementById('copy-modal');
const copyDetail = document.getElementById('copy-detail');
let currentPhotoIndex = 0;
let lastFocusedElement = null;

// 열린 팝업이 있으면 본문 스크롤을 잠급니다.
function openModal(modal) {
  lastFocusedElement = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const focusTarget = modal.querySelector('.modal-close, .confirm-btn');
  if (focusTarget) focusTarget.focus();
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
}

// 사진 경로는 모두 프로젝트 내부의 실제 이미지 파일을 사용합니다.
function showPhoto(index) {
  currentPhotoIndex = (index + photoButtons.length) % photoButtons.length;
  const button = photoButtons[currentPhotoIndex];
  modalImage.src = 'assets/images/' + button.dataset.photo;
  modalImage.alt = button.dataset.alt || '웨딩 사진';
  photoCount.textContent = `${currentPhotoIndex + 1} / ${photoButtons.length}`;
}
photoButtons.forEach((button, index) => button.addEventListener('click', () => {
  showPhoto(index);
  openModal(photoModal);
}));
photoModal.querySelector('.modal-close').addEventListener('click', () => closeModal(photoModal));
photoModal.querySelector('.prev').addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
photoModal.querySelector('.next').addEventListener('click', () => showPhoto(currentPhotoIndex + 1));

// 계좌번호를 클립보드에 복사합니다. 로컬 파일 환경도 지원하는 대체 방법을 제공합니다.
async function copyToClipboard(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(value); return true; } catch (_) { /* 아래 방법으로 재시도 */ }
  }
  const temporary = document.createElement('textarea');
  temporary.value = value;
  temporary.style.position = 'fixed';
  temporary.style.opacity = '0';
  document.body.appendChild(temporary);
  temporary.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
  temporary.remove();
  return copied;
}
document.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', async () => {
  const copied = await copyToClipboard(button.dataset.copy);
  document.getElementById('copy-title').textContent = copied ? '계좌번호가 복사되었습니다' : '계좌번호를 확인해 주세요';
  copyDetail.textContent = `${button.dataset.owner} · ${button.dataset.copy}` + (copied ? '' : '\n브라우저에서 자동 복사가 차단되었습니다.');
  openModal(copyModal);
}));
document.getElementById('copy-confirm').addEventListener('click', () => closeModal(copyModal));

// 바깥 배경 클릭 및 ESC 키로 팝업을 닫습니다.
[photoModal, copyModal].forEach((modal) => modal.addEventListener('click', (event) => {
  if (event.target === modal) closeModal(modal);
}));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (photoModal.classList.contains('is-open')) closeModal(photoModal);
    if (copyModal.classList.contains('is-open')) closeModal(copyModal);
  }
  if (photoModal.classList.contains('is-open') && event.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
  if (photoModal.classList.contains('is-open') && event.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
});
