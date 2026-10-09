// Rolling digits: one column per digit (0-9 stacked); only the digits that change slide. Separators stay put.
export function digits(str, prev) {
  const p = prev && prev.length === str.length ? prev : str;
  return [...str].map((ch, i) => /\d/.test(ch)
    ? `<span class="d"><span class="strip" data-to="${ch}" style="--n:${/\d/.test(p[i]) ? p[i] : ch}">${[...'0123456789'].map(x => `<i>${x}</i>`).join('')}</span></span>`
    : `<span class="c">${ch}</span>`).join('');
}

// Call after the markup is in the page: slides each changed column to its new digit, right-most first.
export function animateRoll(box, delay = 0) {
  let rank = 0;
  const strips = [...box.querySelectorAll('.strip')];
  void box.offsetWidth;
  for (let k = strips.length - 1; k >= 0; k--) {
    const s = strips[k];
    if (s.style.getPropertyValue('--n').trim() !== s.dataset.to) {
      s.style.transitionDelay = `${delay + rank++ * 45}ms`;
      s.style.setProperty('--n', s.dataset.to);
    }
  }
}
