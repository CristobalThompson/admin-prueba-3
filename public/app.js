(() => {
  'use strict';

  const bank = window.studyBank;
  const total = bank.fill.length + bank.choice.length;
  const root = document.querySelector('#view');
  const recordKey = 'admin-catedra3-record-v1';
  const titles = {
    fill: 'Completar frases',
    choice: 'Alternativas',
    challenge: 'Desafío sin errores'
  };
  const symbols = { fill: 'Aa', choice: '≡', challenge: 'ϟ' };
  const descriptions = {
    fill: 'Completa los conceptos clave. Elige entre opciones en fácil o escribe la respuesta en difícil.',
    choice: 'Resuelve preguntas de cuatro opciones, con definiciones, cálculos y casos de aplicación.',
    challenge: 'Alternativas y frases en una sola ronda. Si fallas una, vuelves a empezar desde cero.'
  };
  let state = { mode: 'home' };
  let difficulty = 'easy';
  let best = 0;
  try {
    best = Math.min(total, Math.max(0, Number.parseInt(localStorage.getItem(recordKey), 10) || 0));
  } catch {
    // The quiz still works in browsers that disable local storage.
  }

  const shuffle = (items) => {
    const shuffled = [...items];
    for (let position = shuffled.length - 1; position > 0; position--) {
      const other = Math.floor(Math.random() * (position + 1));
      [shuffled[position], shuffled[other]] = [shuffled[other], shuffled[position]];
    }
    return shuffled;
  };

  const normalize = (value) => value
    .toLocaleLowerCase('es-CL')
    .normalize('NFD')
    .replace(/[\u0300-\u0302\u0308]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/[-\s]+/g, ' ')
    .trim();

  const focusHeading = () => root.querySelector('h1')?.focus();
  const challenge = () => state.mode === 'challenge';
  const activeQuestion = () => state.questions[state.index];

  function start(mode) {
    if (mode === 'home') {
      state = { mode };
    } else {
      const bankItems = mode === 'challenge' ? [...bank.fill, ...bank.choice] : bank[mode];
      state = {
        mode,
        questions: shuffle(bankItems).map(question => ({ ...question, options: shuffle(question.options) })),
        index: 0,
        hits: 0,
        result: null,
        phase: 'question'
      };
    }
    render(true);
    window.scrollTo(0, 0);
  }

  function home() {
    const cards = Object.keys(titles).map(mode => {
      const count = mode === 'challenge' ? total : bank[mode].length;
      return `<button class="mode-card" type="button" data-mode="${mode}">
        <span class="card-meta"><span class="mode-icon ${mode}" aria-hidden="true">${symbols[mode]}</span><span>${count} ${mode === 'fill' ? 'frases' : 'preguntas'}</span></span>
        <strong>${titles[mode]}</strong>
        <span class="card-copy">${descriptions[mode]}</span>
        <span class="card-link">${mode === 'challenge' ? 'Iniciar desafío' : 'Practicar'} <span aria-hidden="true">↗</span></span>
      </button>`;
    }).join('');
    const topics = bank.topics.map(({ name, unit }) => `<li><span>U${unit}</span>${name}</li>`).join('');
    return `<section class="hero">
      <div class="hero-copy">
        <span class="hero-label"><span></span>CÁTEDRA 3</span>
        <h1 tabindex="-1">Sala de estudio<span>.</span></h1>
        <p>Practica los contenidos de Administración de Empresas antes de la prueba.</p>
        <button class="button hero-button" type="button" data-mode="fill">Empezar a estudiar <span aria-hidden="true">→</span></button>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbit orbit-outer"></div><div class="orbit orbit-inner"></div><div class="orbit-mark">✳</div>
        <div class="art-sheet"><div class="sheet-head"><span></span><i></i></div><div class="sheet-row"><b>✓</b><i></i></div><div class="sheet-row"><b>✓</b><i></i></div><div class="sheet-row"><b></b><i></i></div></div>
        <div class="art-chip"><span>✓</span></div>
      </div>
    </section>
    <section class="modes" aria-labelledby="modes-title">
      <div class="section-head"><h2 id="modes-title">Modos de estudio</h2><span>${total} preguntas en total</span></div>
      <div class="mode-grid">${cards}</div>
    </section>
    <section class="topics" aria-labelledby="topics-title">
      <h2 id="topics-title">Temario</h2>
      <ul>${topics}</ul>
    </section>`;
  }

  function quizHeader() {
    const mode = state.mode;
    const level = mode === 'fill' ? `<div class="level" role="group" aria-label="Dificultad">
        <button type="button" data-level="easy" aria-pressed="${difficulty === 'easy'}">Fácil</button>
        <button type="button" data-level="hard" aria-pressed="${difficulty === 'hard'}">Difícil</button>
      </div>` : '';
    return `<div class="quiz-header">
      <div><button type="button" class="text-button back" data-mode="home"><span aria-hidden="true">←</span> Inicio</button>
      <h1 tabindex="-1">${titles[mode]}</h1></div>${level}
    </div>`;
  }

  function controls(question, writeAnswer) {
    if (writeAnswer) {
      return `<label for="written-answer" class="input-label">Tu respuesta</label>
        <input id="written-answer" name="response" type="text" placeholder="Escribe la palabra o expresión" autocomplete="off" spellcheck="false" maxlength="150" required>`;
    }
    return `<fieldset class="options">
      <legend class="sr-only">Elige una opción</legend>
      ${question.options.map((option, index) => {
        const letter = 'ABCD'[index];
        const selected = state.result?.value === option;
        const status = state.result && option === question.answer ? ' correct' : state.result && selected ? ' incorrect' : '';
        return `<label class="option${status}">
          <input type="radio" name="response" value="${index}" ${selected ? 'checked' : ''} ${state.result ? 'disabled' : ''} required>
          <span class="option-letter" aria-hidden="true">${letter}</span><span>${option}</span>
        </label>`;
      }).join('')}
    </fieldset>`;
  }

  function questionView() {
    const question = activeQuestion();
    const writeAnswer = question.kind === 'fill' && (challenge() || difficulty === 'hard');
    const { result, hits, index, questions } = state;
    const completed = index + Number(result !== null);
    const progress = challenge() ? hits : completed;
    const questionPrompt = question.prompt.replace('___', '<span class="blank"><span class="sr-only">espacio en blanco</span></span>');
    const feedback = result ? `<div id="feedback" tabindex="-1" class="feedback ${result.correct ? 'correct' : 'incorrect'}">
        <strong>${result.correct ? '¡Correcto!' : challenge() ? 'Desafío terminado' : 'Respuesta incorrecta'}</strong>
        <p>${result.correct ? '' : `Respuesta esperada: <b>${question.answer}</b>. `}${question.explanation}</p>
        ${challenge() && !result.correct ? `<p>Terminaste con ${hits} de ${total} aciertos seguidos. El siguiente intento comienza en cero.</p>` : ''}
      </div>` : '';
    const action = challenge() && result && !result.correct ? 'Volver a empezar' : completed === questions.length ? 'Ver resultado' : 'Siguiente pregunta';

    return `<div class="quiz">
      ${quizHeader()}
      <div class="progress-row">
        <span>Pregunta ${index + 1} de ${questions.length}</span>
        <strong>${challenge() ? `Racha ${hits} · Récord ${best}` : `${hits} aciertos`}</strong>
      </div>
      <progress value="${progress}" max="${questions.length}" aria-label="${challenge() ? 'Racha' : 'Preguntas respondidas'}"></progress>
      <article class="question-card">
        <div class="question-meta"><span>Unidad ${question.unit}</span><span>${question.topic}</span>${challenge() ? `<span>${question.kind === 'fill' ? 'Frase escrita' : 'Alternativa'}</span>` : ''}</div>
        <h2 id="question-title" tabindex="-1">${questionPrompt}</h2>
        <form id="answer-form" aria-labelledby="question-title">
          ${writeAnswer && result ? '<div class="input-label">Tu respuesta</div><p id="submitted-answer" class="submitted-answer"></p>' : controls(question, writeAnswer)}
          ${feedback}
          <div class="question-footer">
            ${result ? `<button type="button" class="button primary" data-next>${action} <span aria-hidden="true">→</span></button>` : '<button type="submit" class="button primary">Comprobar respuesta <span aria-hidden="true">→</span></button>'}
          </div>
        </form>
      </article>
    </div>`;
  }

  function summary() {
    const { hits, questions } = state;
    return `<div class="quiz">${quizHeader()}
      <section class="question-card summary">
        <span class="mode-icon ${state.mode}" aria-hidden="true">${symbols[state.mode]}</span>
        <h2 tabindex="-1" id="round-heading">${challenge() ? '¡Desafío superado!' : 'Ronda completada'}</h2>
        <p><strong>${hits} / ${questions.length}</strong> respuestas correctas</p>
        <button type="button" class="button primary" data-restart>Practicar de nuevo <span aria-hidden="true">→</span></button>
      </section>
    </div>`;
  }

  function render(focus = false) {
    for (const button of document.querySelectorAll('nav [data-mode]')) {
      if (button.dataset.mode === state.mode) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    }
    root.innerHTML = state.mode === 'home' ? home() : state.phase === 'summary' ? summary() : questionView();
    const submitted = root.querySelector('#submitted-answer');
    if (submitted) submitted.textContent = state.result.value;
    if (focus) focusHeading();
  }

  root.addEventListener('submit', event => {
    if (event.target.id !== 'answer-form') return;
    event.preventDefault();
    if (state.result || state.phase !== 'question') return;

    const question = activeQuestion();
    const response = new FormData(event.target).get('response');
    if (typeof response !== 'string' || !response.trim()) {
      const input = event.target.querySelector('#written-answer');
      input?.setCustomValidity('Escribe una respuesta.');
      input?.reportValidity();
      return;
    }
    const writeAnswer = Boolean(event.target.querySelector('#written-answer'));
    const value = writeAnswer ? response.trim() : question.options[Number(response)];
    const correct = writeAnswer
      ? [question.answer, ...question.aliases].some(answer => normalize(answer) === normalize(value))
      : question.answer === value;
    state.result = { value, correct };
    if (correct) state.hits++;
    if (challenge() && state.hits > best) {
      best = state.hits;
      try {
        localStorage.setItem(recordKey, String(best));
      } catch {
        // Keep the record for this visit even if persistence is unavailable.
      }
    }
    render();
    root.querySelector('#feedback')?.focus();
  });

  root.addEventListener('input', event => {
    if (event.target.id === 'written-answer') event.target.setCustomValidity('');
  });

  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.mode && button.dataset.mode !== state.mode) {
      start(button.dataset.mode);
    } else if (button.dataset.level && button.dataset.level !== difficulty) {
      difficulty = button.dataset.level;
      start('fill');
      root.querySelector(`[data-level="${difficulty}"]`)?.focus();
    } else if (button.hasAttribute('data-restart')) {
      start(state.mode);
    } else if (button.hasAttribute('data-next') && state.result) {
      if (challenge() && !state.result.correct) {
        start(state.mode);
      } else if (state.index + 1 === state.questions.length) {
        state.phase = 'summary';
        render();
        root.querySelector('#round-heading')?.focus();
      } else {
        state.index++;
        state.result = null;
        render();
        root.querySelector('#question-title')?.focus();
      }
    }
  });

  render();
})();
