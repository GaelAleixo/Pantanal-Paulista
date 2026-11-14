/* Limpa o formulário ao exibir a página (inclusive ao voltar pelo histórico) */
window.addEventListener('pageshow', function () {
  var form = document.querySelector('form');
  if (form) form.reset();
});
