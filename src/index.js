import { createApp } from 'vue';
import { createMemoryHistory, createWebHashHistory, createWebHistory, createRouter } from 'vue-router';

import ToDo from './pages/ToDo.vue';
import Modals from './pages/Modals.vue';
import Messages from './pages/Messages.vue';
import ChuckNorris from './pages/ChuckNorris.vue';
import RickAndMorty from './pages/RickAndMorty.vue';
import CanvasExample from './pages/CanvasExample.vue';
import WebApis from './pages/WebApis.vue';
import ClipboardDemo from './pages/ClipboardDemo.vue';

const routes = [
  { path: '/', component: ToDo, name: 'ToDo' },
  { path: '/modals', component: Modals, name: 'Modals' },
  { path: '/messages', component: Messages, name: 'Messages' },
  { path: '/chuck', component: ChuckNorris, name: 'Chuck Norris' },
  { path: '/rickandmorty', component: RickAndMorty, name: 'Rick And Morty' },
  { path: '/canvas', component: CanvasExample, name: 'Canvas' },
  { path: '/webapis', component: WebApis, name: 'WebApis' },
  { path: '/clipboard', component: ClipboardDemo, name: 'Clipboard API' },
];

export const router = createRouter({
  // BASE_URL tuleb Vite'ist: GitHub Pages serveerib lehte alamkaustast
  // /ta24blearnnode/, localhostis on see lihtsalt '/'.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});



// import the root component App from a single-file component.
import App from './App.vue';

const app = createApp(App).use(router).mount('#app');