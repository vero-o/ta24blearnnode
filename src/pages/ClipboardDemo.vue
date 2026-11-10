<script setup>
/*
 * Web API demo - Clipboard API
 * Jegor Onoprijuk, TA-24B
 *
 * MDN: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API
 *
 * Clipboard API lubab lehel lõikelauale kirjutada (navigator.clipboard.writeText)
 * ja sealt lugeda (navigator.clipboard.readText). Lugemine küsib Chromes eraldi
 * luba, seega siin on ka loa keeldumise käsitlus.
 */
import { ref, computed, onMounted } from 'vue';

const textToCopy = ref('Tere! Selle teksti kirjutas lõikelauale Clipboard API. — Jegor, TA-24B');
const pastedText = ref('');
const status = ref(null);        // { type: 'ok' | 'error', message: string }
const permissionState = ref('teadmata');
const history = ref([]);

// Kas brauser üldse toetab? Clipboard API töötab ainult turvalises kontekstis
// (https või localhost), seega kontrollin mõlemat.
const isSecure = typeof window !== 'undefined' && window.isSecureContext;
const hasClipboard = typeof navigator !== 'undefined' && !!navigator.clipboard;
const supported = computed(() => hasClipboard && isSecure);

const supportMessage = computed(() => {
  if (!hasClipboard) return 'See brauser ei toeta Clipboard API-t (navigator.clipboard puudub).';
  if (!isSecure) return 'Clipboard API töötab ainult turvalises kontekstis — ava leht https:// või localhost aadressil.';
  return null;
});

function log(action, detail) {
  history.value.unshift({
    time: new Date().toLocaleTimeString('et-EE'),
    action,
    detail,
  });
  if (history.value.length > 8) history.value.pop();
}

async function checkPermission() {
  // Permissions API ei ole igal pool olemas ja 'clipboard-read' nime ei tunne
  // kõik brauserid — seega try/catch.
  try {
    const res = await navigator.permissions.query({ name: 'clipboard-read' });
    permissionState.value = res.state;          // granted | prompt | denied
  } catch {
    permissionState.value = 'brauser ei oska seda küsida';
  }
}

async function copyText() {
  status.value = null;
  if (!supported.value) {
    status.value = { type: 'error', message: supportMessage.value };
    return;
  }
  try {
    await navigator.clipboard.writeText(textToCopy.value);
    status.value = {
      type: 'ok',
      message: `Kopeeritud lõikelauale (${textToCopy.value.length} märki). Proovi nüüd Cmd/Ctrl+V kuhugi mujale.`,
    };
    log('writeText', `${textToCopy.value.length} märki`);
  } catch (err) {
    status.value = { type: 'error', message: `Kopeerimine ebaõnnestus: ${err.name} — ${err.message}` };
    log('writeText VIGA', err.name);
  }
}

async function pasteText() {
  status.value = null;
  if (!supported.value) {
    status.value = { type: 'error', message: supportMessage.value };
    return;
  }
  try {
    const text = await navigator.clipboard.readText();
    pastedText.value = text;
    status.value = text
      ? { type: 'ok', message: `Loetud lõikelaualt ${text.length} märki.` }
      : { type: 'ok', message: 'Lõikelaud on tühi.' };
    log('readText', `${text.length} märki`);
  } catch (err) {
    // Kõige tavalisem juhtum: kasutaja vajutas loa aknas "Block".
    const reason =
      err.name === 'NotAllowedError'
        ? 'Kasutaja ei andnud lõikelaua lugemise luba (või brauser keelas selle).'
        : `${err.name} — ${err.message}`;
    status.value = { type: 'error', message: `Lugemine ebaõnnestus: ${reason}` };
    log('readText VIGA', err.name);
  }
  await checkPermission();
}

function clearAll() {
  pastedText.value = '';
  status.value = null;
  history.value = [];
}

onMounted(() => {
  if (supported.value) checkPermission();
});
</script>

<template>
  <div class="content">
    <h1 class="title">Web API demo — Clipboard API</h1>
    <p class="subtitle">
      Clipboard API lubab JavaScriptil lõikelauale kirjutada ja sealt lugeda, ilma et
      kasutaja peaks ise Ctrl+C / Ctrl+V vajutama. Lugemine nõuab kasutaja luba.
    </p>

    <div class="notification is-warning" v-if="!supported">
      <strong>Ei saa demot käivitada.</strong> {{ supportMessage }}
    </div>

    <div class="box">
      <h2 class="is-size-5">1. Kirjuta lõikelauale — <code>navigator.clipboard.writeText()</code></h2>
      <div class="field">
        <label class="label" for="copy-input">Tekst, mis läheb lõikelauale</label>
        <div class="control">
          <textarea id="copy-input" class="textarea" rows="3" v-model="textToCopy"></textarea>
        </div>
      </div>
      <button class="button is-primary" :disabled="!supported" @click="copyText">
        Kopeeri lõikelauale
      </button>
    </div>

    <div class="box">
      <h2 class="is-size-5">2. Loe lõikelaualt — <code>navigator.clipboard.readText()</code></h2>
      <p>
        Loa olek (<code>clipboard-read</code>):
        <span class="tag" :class="{
          'is-success': permissionState === 'granted',
          'is-warning': permissionState === 'prompt',
          'is-danger': permissionState === 'denied',
        }">{{ permissionState }}</span>
      </p>
      <button class="button is-link" :disabled="!supported" @click="pasteText">
        Loe lõikelaualt
      </button>
      <button class="button is-light ml-2" @click="clearAll">Tühjenda</button>

      <div class="field mt-4" v-if="pastedText !== ''">
        <label class="label">Lõikelaualt loetud sisu</label>
        <pre>{{ pastedText }}</pre>
      </div>
    </div>

    <div
      v-if="status"
      class="notification"
      :class="status.type === 'ok' ? 'is-success' : 'is-danger'"
    >
      {{ status.message }}
    </div>

    <div class="box" v-if="history.length">
      <h2 class="is-size-5">Mida API-ga tehti</h2>
      <table class="table is-fullwidth is-narrow">
        <thead>
          <tr><th>Kell</th><th>Meetod</th><th>Tulemus</th></tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in history" :key="i">
            <td>{{ row.time }}</td>
            <td><code>{{ row.action }}</code></td>
            <td>{{ row.detail }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="box">
      <h2 class="is-size-5">Mida ma selle API juures õppisin</h2>
      <ul>
        <li>
          <strong>Turvaline kontekst on kohustuslik.</strong> <code>navigator.clipboard</code> on
          <code>undefined</code>, kui leht ei ole https või localhost — seepärast kontrollin
          <code>window.isSecureContext</code> enne nupu lubamist.
        </li>
        <li>
          <strong>Kirjutamine ja lugemine ei ole võrdsed.</strong> <code>writeText()</code> töötab
          kasutaja klõpsu peale ilma loata, <code>readText()</code> küsib Chromes eraldi luba —
          muidu saaks iga leht vaikselt su lõikelaua sisu ära lugeda.
        </li>
        <li>
          <strong>Keeldumine tuleb vea kaudu.</strong> Kui kasutaja vajutab "Block", viskab
          <code>readText()</code> <code>NotAllowedError</code>. Seepärast on siin try/catch ja
          eraldi inimkeelne tekst, mitte lihtsalt <code>console.log</code>.
        </li>
      </ul>
      <p>
        Dokumentatsioon:
        <a href="https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API" target="_blank" rel="noreferrer">
          MDN — Clipboard API
        </a>
      </p>
    </div>
  </div>
</template>

<style scoped>
pre {
  white-space: pre-wrap;
  word-break: break-word;
}
.ml-2 { margin-left: 0.5rem; }
</style>
