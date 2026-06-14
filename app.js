const stages = [
  { id: "novo", label: "Novo" },
  { id: "contato", label: "Em contato" },
  { id: "proposta", label: "Proposta" },
  { id: "ganho", label: "Ganho" },
];

const liaSampleImagePath = "imagens-modelos/lia-amostra-01.png";
const liaPacks = [
  { id: "pack_10_fotos", title: "10 fotos", description: "R$19,90" },
  { id: "pack_30_fotos", title: "30 fotos", description: "R$39,90" },
  { id: "pack_20_fotos_1_video", title: "20 fotos + video", description: "R$59,90" },
];

const builtInModelPacks = [
  {
    id: "lia-pack-01",
    model: "Lia",
    title: "Neon 09",
    description: "10 fotos e 2 videos da Lia",
    price: "R$ 49",
    cover: "imagens-modelos/lia/pack-01/fotos/grok-13f7d6f3-a590-4f0d-8e41-853ba1f3b957.jpg",
    media: [
      { id: "lia-foto-01", title: "Foto Lia 01", path: "imagens-modelos/lia/pack-01/fotos/grok-13f7d6f3-a590-4f0d-8e41-853ba1f3b957.jpg", type: "image" },
      { id: "lia-foto-02", title: "Foto Lia 02", path: "imagens-modelos/lia/pack-01/fotos/grok-25bbae71-8dc8-4edd-a5aa-b05db4691d07.jpg", type: "image" },
      { id: "lia-foto-03", title: "Foto Lia 03", path: "imagens-modelos/lia/pack-01/fotos/grok-53893a3c-62db-4a4a-90e6-e2761eac636d.jpg", type: "image" },
      { id: "lia-foto-04", title: "Foto Lia 04", path: "imagens-modelos/lia/pack-01/fotos/grok-6b27c520-a4dc-41fc-8698-55b0ae141259.jpg", type: "image" },
      { id: "lia-foto-05", title: "Foto Lia 05", path: "imagens-modelos/lia/pack-01/fotos/grok-770e81eb-9b4d-4c05-90f6-59aba2a76aab.jpg", type: "image" },
      { id: "lia-foto-06", title: "Foto Lia 06", path: "imagens-modelos/lia/pack-01/fotos/grok-8d30d6cb-01e1-472c-ace4-3e1f80afc9d0.jpg", type: "image" },
      { id: "lia-foto-07", title: "Foto Lia 07", path: "imagens-modelos/lia/pack-01/fotos/grok-b238247f-9af4-45f3-a0e0-a25902b63e15.jpg", type: "image" },
      { id: "lia-foto-08", title: "Foto Lia 08", path: "imagens-modelos/lia/pack-01/fotos/grok-b8444a2b-5024-41f7-8050-a3849d1921ea.jpg", type: "image" },
      { id: "lia-foto-09", title: "Foto Lia 09", path: "imagens-modelos/lia/pack-01/fotos/grok-b8fe5d02-c34e-4c6f-b539-85989bd5966e.jpg", type: "image" },
      { id: "lia-foto-10", title: "Foto Lia 10", path: "imagens-modelos/lia/pack-01/fotos/grok-e1dae7c1-cde8-4eee-b43c-1b335a90d02d.jpg", type: "image" },
      { id: "lia-video-01", title: "Video Lia 01", path: "imagens-modelos/lia/pack-01/videos/grok-69f84467-0e85-4ae5-8d3a-7aec2b6f6aec.mp4", type: "video" },
      { id: "lia-video-02", title: "Video Lia 02", path: "imagens-modelos/lia/pack-01/videos/grok-a25bd720-3e49-4e47-b0ad-a795e135cc19.mp4", type: "video" },
    ],
  },
  {
    id: "ingredi-pack-01",
    model: "Ingredi",
    title: "Pulse 10",
    description: "11 fotos e 2 videos da Ingredi",
    price: "R$ 49",
    cover: "imagens-modelos/ingredi/pack-01/fotos/grok-0033eb5d-99ca-4c44-988a-aca9f954d851.jpg",
    media: [
      { id: "ingredi-foto-01", title: "Foto Ingredi 01", path: "imagens-modelos/ingredi/pack-01/fotos/grok-0033eb5d-99ca-4c44-988a-aca9f954d851.jpg", type: "image" },
      { id: "ingredi-foto-02", title: "Foto Ingredi 02", path: "imagens-modelos/ingredi/pack-01/fotos/grok-09fee6f2-40dc-4e96-8912-8b4f6c4a4222.png", type: "image" },
      { id: "ingredi-foto-03", title: "Foto Ingredi 03", path: "imagens-modelos/ingredi/pack-01/fotos/grok-214510bd-0a21-4a88-9e79-3f33afc99f99.jpg", type: "image" },
      { id: "ingredi-foto-04", title: "Foto Ingredi 04", path: "imagens-modelos/ingredi/pack-01/fotos/grok-24c54342-893b-4fbe-8527-a4a12984989c.jpg", type: "image" },
      { id: "ingredi-foto-05", title: "Foto Ingredi 05", path: "imagens-modelos/ingredi/pack-01/fotos/grok-36ece805-c52c-43e1-a6f0-b6b630e9118a.png", type: "image" },
      { id: "ingredi-foto-06", title: "Foto Ingredi 06", path: "imagens-modelos/ingredi/pack-01/fotos/grok-54272167-ec24-465f-9dc5-f517037c9998.jpg", type: "image" },
      { id: "ingredi-foto-07", title: "Foto Ingredi 07", path: "imagens-modelos/ingredi/pack-01/fotos/grok-5ffebd9f-93b5-4943-919a-ece696c3f775.jpg", type: "image" },
      { id: "ingredi-foto-08", title: "Foto Ingredi 08", path: "imagens-modelos/ingredi/pack-01/fotos/grok-76ddb1a5-d044-44d8-b137-10ed66662738.jpg", type: "image" },
      { id: "ingredi-foto-09", title: "Foto Ingredi 09", path: "imagens-modelos/ingredi/pack-01/fotos/grok-a364730b-8d33-4661-878f-49497db504a2.jpg", type: "image" },
      { id: "ingredi-foto-10", title: "Foto Ingredi 10", path: "imagens-modelos/ingredi/pack-01/fotos/grok-a538875f-726b-4e60-8489-1bd9f7299672.jpg", type: "image" },
      { id: "ingredi-foto-11", title: "Foto Ingredi 11", path: "imagens-modelos/ingredi/pack-01/fotos/grok-f9267038-5239-479e-969c-a59aeaca5223.jpg", type: "image" },
      { id: "ingredi-video-01", title: "Video Ingredi 01", path: "imagens-modelos/ingredi/pack-01/videos/grok-a4fff83a-7677-491a-a0d1-144e6232d616.mp4", type: "video" },
      { id: "ingredi-video-02", title: "Video Ingredi 02", path: "imagens-modelos/ingredi/pack-01/videos/grok-b3b710d1-992c-4db0-9dbb-0972cd48e2a6.mp4", type: "video" },
    ],
  },
];

const initialLeads = [
  {
    id: "lead-thiago",
    name: "Thiago Silva",
    phone: "55 92 8407-8295",
    interest: "Packs de conteudo adulto",
    source: "Meta WhatsApp",
    stage: "proposta",
    tags: ["whatsapp", "meta", "maior18_confirmado"],
    notes: "Prefere conteudo mais leve no comeco. Respondeu rapido a amostra. Proximo passo: fechar Pack Premium.",
    activities: ["Oferecer Pack Premium", "Enviar amostra autorizada da Lia"],
    messages: [
      { id: "msg-1", from: "client", text: "Oi, vi seu perfil 👀 voce tem conteudo novo?", at: "18:54" },
      { id: "msg-2", from: "agent", text: "Oi Thiago 😈 que bom que me achou. To preparando uns conteudos fresquinhos hoje... quer dar uma espiada antes de todo mundo?", at: "18:55" },
      { id: "msg-3", from: "client", text: "Quero sim, o que voce tem?", at: "19:01" },
      { id: "msg-4", from: "agent", text: "Essa e so uma provinha 😏 o pack completo tem fotos e videos com um clima bem mais provocante.", mediaUrl: liaSampleImagePath, mediaType: "image", at: "19:07" },
    ],
  },
  {
    id: "lead-bruno",
    name: "Bruno Lima",
    phone: "(92) 99220-1100",
    interest: "Assinatura semanal",
    source: "Instagram",
    stage: "proposta",
    tags: ["assinatura", "retorno", "maior18_confirmado"],
    notes: "Pediu valores e confirmou ser maior de 18 anos.",
    activities: ["Enviar oferta do pack escolhido", "Registrar consentimento antes de disparos"],
    messages: [
      { id: "msg-3", from: "client", text: "Tem pacote semanal?", at: "10:06" },
      { id: "msg-4", from: "agent", text: "Gostou, Bruno? Entao vem ver mais da Lia:\n\n10 fotos minhas por apenas R$19,90\n30 fotos minhas por R$39,90\n20 fotos + 1 video por R$59,90\n\nQual pack voce quer?", at: "10:08" },
    ],
  },
];

const state = {
  leads: [],
  mediaPacks: [],
  activeStage: "todos",
  activeLeadId: null,
  activeView: "atendimento",
  activeMediaPackId: null,
  search: "",
  apiEnabled: false,
  loading: true,
  syncing: false,
  lastSyncAt: null,
};

const els = {
  metricLeads: document.querySelector("#metric-leads"),
  metricOpen: document.querySelector("#metric-open"),
  metricSales: document.querySelector("#metric-sales"),
  metricAdult: document.querySelector("#metric-adult"),
  viewButtons: document.querySelectorAll("[data-view]"),
  searchInput: document.querySelector("#search-input"),
  newLeadButton: document.querySelector("#new-lead-button"),
  newLeadButtonAlt: document.querySelector("#new-lead-button-alt"),
  stageTabs: document.querySelector("#stage-tabs"),
  leadList: document.querySelector("#lead-list"),
  leadTableBody: document.querySelector("#lead-table-body"),
  pipelineBoard: document.querySelector("#pipeline-board"),
  leadListCount: document.querySelector("#lead-list-count"),
  leadName: document.querySelector("#lead-name"),
  leadMeta: document.querySelector("#lead-meta"),
  summaryPhone: document.querySelector("#summary-phone"),
  summarySource: document.querySelector("#summary-source"),
  summaryAge: document.querySelector("#summary-age"),
  summaryLastMessage: document.querySelector("#summary-last-message"),
  stageSelect: document.querySelector("#stage-select"),
  markDoneButton: document.querySelector("#mark-done-button"),
  chatContactName: document.querySelector("#chat-contact-name"),
  chatContactStatus: document.querySelector("#chat-contact-status"),
  syncStatus: document.querySelector("#sync-status"),
  chatFeed: document.querySelector("#chat-feed"),
  messageForm: document.querySelector("#message-form"),
  messageInput: document.querySelector("#message-input"),
  mediaInput: document.querySelector("#media-input"),
  leadPhone: document.querySelector("#lead-phone"),
  leadInterest: document.querySelector("#lead-interest"),
  leadSource: document.querySelector("#lead-source"),
  leadTags: document.querySelector("#lead-tags"),
  leadPreference: document.querySelector("#lead-preference"),
  leadFormat: document.querySelector("#lead-format"),
  leadBuyingSignal: document.querySelector("#lead-buying-signal"),
  modelGallery: document.querySelector("#model-gallery"),
  modelGalleryPage: document.querySelector("#model-gallery-page"),
  packForm: document.querySelector("#pack-form"),
  dataRevenue: document.querySelector("#data-revenue"),
  dataRevenueNote: document.querySelector("#data-revenue-note"),
  dataActiveLeads: document.querySelector("#data-active-leads"),
  dataActiveNote: document.querySelector("#data-active-note"),
  dataConversion: document.querySelector("#data-conversion"),
  dataConversionNote: document.querySelector("#data-conversion-note"),
  dataTicket: document.querySelector("#data-ticket"),
  noteInput: document.querySelector("#note-input"),
  saveNoteButton: document.querySelector("#save-note-button"),
  activityList: document.querySelector("#activity-list"),
  sendTemplateButton: document.querySelector("#send-template-button"),
  submitTemplatesButton: document.querySelector("#submit-templates-button"),
  sendAudioPreviewButton: document.querySelector("#send-audio-preview-button"),
  requestCallButton: document.querySelector("#request-call-button"),
  createPixButton: document.querySelector("#create-pix-button"),
  leadDialog: document.querySelector("#lead-dialog"),
  leadForm: document.querySelector("#lead-form"),
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `API ${response.status}`);
  }

  return response.status === 204 ? null : response.json();
}

function loadLocalLeads() {
  const stored = localStorage.getItem("modelia-crm-leads");
  if (!stored) return initialLeads;

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : initialLeads;
  } catch {
    return initialLeads;
  }
}

function loadLocalPacks() {
  const stored = localStorage.getItem("modelia-crm-media-packs");
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalPacks() {
  localStorage.setItem("modelia-crm-media-packs", JSON.stringify(state.mediaPacks));
}

function getAllModelPacks() {
  return [...builtInModelPacks, ...state.mediaPacks];
}

function saveLocalLeads() {
  localStorage.setItem("modelia-crm-leads", JSON.stringify(state.leads));
}

async function loadLeads() {
  try {
    const payload = await api("/api/leads");
    state.leads = payload.leads;
    state.apiEnabled = true;
    state.lastSyncAt = new Date();
  } catch {
    state.leads = loadLocalLeads();
    state.apiEnabled = false;
  }
}

async function loadPacks() {
  try {
    const payload = await api("/api/packs");
    state.mediaPacks = Array.isArray(payload.packs) ? payload.packs : [];
  } catch {
    state.mediaPacks = loadLocalPacks();
  }
}

async function refreshLeads(options = {}) {
  if (!state.apiEnabled || state.syncing || (document.hidden && !options.force)) return;

  state.syncing = true;
  renderSyncStatus("Atualizando...");

  try {
    const payload = await api(`/api/leads?ts=${Date.now()}`);
    const activeLeadExists = payload.leads.some((lead) => lead.id === state.activeLeadId);
    state.leads = payload.leads;
    state.lastSyncAt = new Date();

    if (!activeLeadExists) {
      state.activeLeadId = state.leads[0]?.id || null;
    }

    render();
  } catch {
    renderSyncStatus("Sem conexao");
  } finally {
    state.syncing = false;
    renderSyncStatus();
  }
}

function getActiveLead() {
  return state.leads.find((lead) => lead.id === state.activeLeadId) || state.leads[0] || null;
}

function filteredLeads() {
  const query = state.search.trim().toLowerCase();
  return state.leads.filter((lead) => {
    const inStage = state.activeStage === "todos" || lead.stage === state.activeStage;
    const haystack = [lead.name, lead.phone, lead.interest, lead.source, ...lead.tags].join(" ").toLowerCase();
    return inStage && (!query || haystack.includes(query));
  });
}

function renderMetrics() {
  const activeLeads = state.leads.filter((lead) => lead.stage !== "ganho").length;
  const totalMessages = state.leads.reduce((total, lead) => total + (lead.messages?.length || 0), 0);
  const wonLeads = state.leads.filter((lead) => lead.stage === "ganho").length;
  const conversion = state.leads.length ? Math.round((wonLeads / state.leads.length) * 100) : 0;

  els.metricLeads.textContent = activeLeads;
  els.metricOpen.textContent = totalMessages;
  els.metricSales.textContent = `${conversion}%`;
  if (els.metricAdult) {
    els.metricAdult.textContent = state.leads.filter((lead) => lead.tags.includes("maior18_confirmado")).length;
  }
}

function renderDataDashboard() {
  const totalLeads = state.leads.length;
  const wonLeads = state.leads.filter((lead) => lead.stage === "ganho").length;
  const activeLeads = state.leads.filter((lead) => lead.stage !== "ganho").length;
  const conversion = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const estimatedRevenue = wonLeads * 49;

  if (els.dataRevenue) els.dataRevenue.textContent = formatCurrency(estimatedRevenue);
  if (els.dataRevenueNote) els.dataRevenueNote.textContent = `${wonLeads} leads ganhos`;
  if (els.dataActiveLeads) els.dataActiveLeads.textContent = activeLeads;
  if (els.dataActiveNote) els.dataActiveNote.textContent = `${totalLeads} leads no total`;
  if (els.dataConversion) els.dataConversion.textContent = `${conversion}%`;
  if (els.dataConversionNote) els.dataConversionNote.textContent = `${wonLeads}/${totalLeads || 0} ganhos`;
  if (els.dataTicket) els.dataTicket.textContent = "R$ 49";
}

function renderActiveView() {
  document.body.dataset.view = state.activeView;
  els.viewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.activeView);
  });
}

function renderStageTabs() {
  const tabs = [{ id: "todos", label: "Todos" }, ...stages];
  els.stageTabs.innerHTML = tabs
    .map((stage) => {
      const active = stage.id === state.activeStage ? "active" : "";
      return `<button class="${active}" type="button" data-stage="${stage.id}">${stage.label}</button>`;
    })
    .join("");
}

function renderLeadList() {
  if (state.loading) {
    els.leadList.innerHTML = `<div class="empty-state">Carregando conversas...</div>`;
    return;
  }

  const leads = filteredLeads();
  if (els.leadListCount) {
    els.leadListCount.textContent = `${leads.length} ${leads.length === 1 ? "lead" : "leads"}`;
  }

  if (!leads.length) {
    els.leadList.innerHTML = `<div class="empty-state">Nenhum lead encontrado.</div>`;
    return;
  }

  els.leadList.innerHTML = leads
    .map((lead) => {
      const stageLabel = stages.find((stage) => stage.id === lead.stage)?.label || "Novo";
      const active = lead.id === state.activeLeadId ? "active" : "";
      const lastMessage = getLastMessage(lead);
      const ageClass = lead.tags.includes("maior18_confirmado")
        ? "confirmed"
        : lead.tags.includes("menor18_bloqueado")
          ? "blocked"
          : "";
      const score = lead.stage === "proposta" ? 87 : lead.stage === "contato" ? 74 : 61;
      return `
        <button class="lead-card ${active}" type="button" data-lead-id="${lead.id}">
          <header>
            <div>
              <strong>${escapeHtml(lead.name)}</strong>
              <p>${escapeHtml(lead.phone)}</p>
            </div>
            <span class="badge">${stageLabel}</span>
          </header>
          <div class="lead-card-meta">
            <span class="age-dot ${ageClass}">${escapeHtml(getAgeStatusLabel(lead))}</span>
            <span>${lead.messages.length} msgs</span>
          </div>
          <p class="lead-preview">${escapeHtml(lastMessage?.text || lead.interest || "Sem mensagens")}</p>
          <div class="lead-score"><span style="width: ${score}%"></span><strong>${score}</strong></div>
        </button>
      `;
    })
    .join("");
}

function renderLeadTable() {
  const leads = filteredLeads();
  if (els.pipelineBoard) {
    els.pipelineBoard.innerHTML = stages
      .map((stage) => {
        const stageLeads = leads.filter((lead) => lead.stage === stage.id);
        return `
          <section class="pipeline-column">
            <header>
              <span>${escapeHtml(stage.label)}</span>
              <strong>${stageLeads.length}</strong>
            </header>
            <div>
              ${
                stageLeads.length
                  ? stageLeads.map((lead) => renderPipelineCard(lead)).join("")
                  : `<p class="pipeline-empty">Sem leads nesta etapa.</p>`
              }
            </div>
          </section>
        `;
      })
      .join("");
  }

  if (!els.leadTableBody) return;

  if (!leads.length) {
    els.leadTableBody.innerHTML = `
      <tr>
        <td colspan="5" class="table-empty">Nenhum lead encontrado.</td>
      </tr>
    `;
    return;
  }

  els.leadTableBody.innerHTML = leads
    .map((lead) => {
      const stageLabel = stages.find((stage) => stage.id === lead.stage)?.label || "Novo";
      const lastMessage = getLastMessage(lead);
      const profile = getLeadProfile(lead);
      const active = lead.id === state.activeLeadId ? "active" : "";
      return `
        <tr class="${active}" data-lead-row-id="${escapeAttribute(lead.id)}">
          <td>
            <button class="table-contact" type="button" data-lead-id="${escapeAttribute(lead.id)}">
              <strong>${escapeHtml(lead.name)}</strong>
              <span>${escapeHtml(lead.phone)}</span>
            </button>
          </td>
          <td><span class="table-status">${escapeHtml(getAgeStatusLabel(lead))}</span></td>
          <td><span class="badge">${escapeHtml(stageLabel)}</span></td>
          <td>${escapeHtml(profile.preference)}</td>
          <td class="table-preview">${escapeHtml(lastMessage?.text || lead.interest || "-")}</td>
        </tr>
      `;
    })
    .join("");
}

function renderPipelineCard(lead) {
  const lastMessage = getLastMessage(lead);
  const profile = getLeadProfile(lead);
  const score = lead.stage === "proposta" ? 87 : lead.stage === "contato" ? 74 : lead.stage === "novo" ? 61 : 44;
  return `
    <button class="pipeline-card" type="button" data-lead-row-id="${escapeAttribute(lead.id)}">
      <strong>${escapeHtml(lead.name)}</strong>
      <span>${escapeHtml(lastMessage?.text || lead.interest || "Sem mensagem")}</span>
      <div class="pipeline-tags">
        <em>${escapeHtml(getAgeStatusLabel(lead))}</em>
        <em>${escapeHtml(profile.buyingSignal)}</em>
      </div>
      <div class="lead-score"><span style="width: ${score}%"></span><strong>${score}</strong></div>
    </button>
  `;
}

function renderLeadDetails() {
  const lead = getActiveLead();

  if (!lead) {
    els.leadName.textContent = "Nenhum lead";
    els.leadMeta.textContent = "Crie um novo lead para iniciar.";
    els.chatContactName.textContent = "Lia safadinha";
    els.chatContactStatus.textContent = "Aguardando confirmacao 18+";
    els.summaryPhone.textContent = "-";
    els.summarySource.textContent = "-";
    els.summaryAge.textContent = "Aguardando 18+";
    els.summaryLastMessage.textContent = "-";
    els.chatFeed.innerHTML = `<div class="empty-state">Sem conversa por enquanto.</div>`;
    return;
  }

  const lastMessage = getLastMessage(lead);
  const profile = getLeadProfile(lead);
  state.activeLeadId = lead.id;
  els.leadName.textContent = lead.name;
  els.leadMeta.textContent = `${lead.source} - ${lead.phone}`;
  els.summaryPhone.textContent = lead.phone;
  els.summarySource.textContent = lead.source;
  els.summaryAge.textContent = getAgeStatusLabel(lead);
  els.summaryLastMessage.textContent = lastMessage?.at || "-";
  els.chatContactName.textContent = `Lia com ${lead.name}`;
  els.chatContactStatus.textContent = `${lead.messages.length} mensagens no historico - ${getAgeStatusLabel(lead)}`;
  els.leadPhone.textContent = lead.phone;
  els.leadInterest.textContent = lead.interest;
  els.leadSource.textContent = lead.source;
  els.leadPreference.textContent = profile.preference;
  els.leadFormat.textContent = profile.format;
  els.leadBuyingSignal.textContent = profile.buyingSignal;
  els.noteInput.value = lead.notes || "";
  els.stageSelect.value = lead.stage;
  els.leadTags.innerHTML = lead.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
  els.activityList.innerHTML = lead.activities.length
    ? lead.activities.map((item) => `<div class="activity"><strong>${escapeHtml(item)}</strong><span>${item.includes("Premium") ? "R$ 49 · agora" : "em 2h"}</span></div>`).join("")
    : `<div class="empty-state">Nenhuma acao pendente.</div>`;

  const visibleMessages = lead.messages || [];
  document.body.dataset.chatEmpty = visibleMessages.length ? "false" : "true";
  els.chatFeed.innerHTML = visibleMessages.length
    ? visibleMessages.map((message) => {
      const direction = message.from === "agent" ? "outbound" : "inbound";
      const mediaUrl = getMessageMediaUrl(message);
      const mediaType = String(message.mediaType || message.media_type || "");
      const media = mediaUrl
        ? mediaType === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl)
          ? `<video class="message-media" src="${escapeAttribute(mediaUrl)}" controls preload="metadata"></video>`
          : `<img class="message-media" src="${escapeAttribute(mediaUrl)}" alt="Midia enviada no chat" loading="lazy" referrerpolicy="no-referrer" />`
        : "";
      const packCards = renderPackCards(message);
      return `
        <article class="message ${direction}">
          ${media}
          ${message.text ? `<p>${escapeHtml(message.text)}</p>` : `<p>${message.from === "client" ? "Mensagem recebida pelo WhatsApp." : "Registro sem texto."}</p>`}
          ${packCards}
          <time>${escapeHtml(message.at || "")}${renderMessageStatus(message)}</time>
        </article>
      `;
    }).join("")
    : `<div class="empty-state chat-empty-state"><strong>Sem historico salvo</strong><span>Quando este lead responder pelo WhatsApp, as mensagens aparecem aqui em ordem real.</span></div>`;
  els.chatFeed.scrollTop = els.chatFeed.scrollHeight;
}

function getMessageMediaUrl(message) {
  const value = String(message.mediaUrl || message.media_url || "").trim();
  if (!value || value.startsWith("meta-media:")) return "";
  if (value.startsWith("data:") || value.startsWith("blob:")) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return getPublicPhotoUrl(value.replace(/^\/+/, ""));
}

function renderPackCards(message) {
  const text = normalizeText(message.text || "");
  const shouldRender = message.packs || (message.from === "agent" && text.includes("escolhe teu pack"));
  if (!shouldRender) return "";

  const packs = message.packs || liaPacks;
  return `
    <div class="pack-grid" aria-label="Packs disponiveis">
      ${packs
        .map(
          (pack) => `
            <button class="pack-card" type="button" data-pack-id="${escapeAttribute(pack.id)}" data-reply="${escapeAttribute(pack.id)}">
              <strong>${escapeHtml(pack.title)}</strong>
              <span>${escapeHtml(pack.description)}</span>
            </button>
          `
        )
        .join("")}
    </div>
  `;
}

function renderMessageStatus(message) {
  if (message.from !== "agent" || !message.status) return "";
  const labels = {
    sending: "Enviando",
    sent: "Enviada",
    delivered: "Entregue",
    read: "Lida",
    failed: "Falhou",
    stored: "Salva",
  };
  const label = labels[message.status] || message.status;
  const error = String(message.providerError || message.provider_error || "").trim();
  const title = error ? ` title="${escapeAttribute(error)}"` : "";
  const errorText = error ? `: ${error}` : "";
  return ` <span class="message-status ${escapeAttribute(message.status)}"${title}>${escapeHtml(label + errorText)}</span>`;
}

function renderStageSelect() {
  els.stageSelect.innerHTML = stages
    .map((stage) => `<option value="${stage.id}">${stage.label}</option>`)
    .join("");
}

function renderModelGallery() {
  const origin = getPublicOrigin();
  const modelPacks = getAllModelPacks();
  const activePack = modelPacks.find((pack) => pack.id === state.activeMediaPackId);
  const galleryHtml = activePack ? renderPackMedia(activePack, origin) : renderMediaPackCards();

  els.modelGallery.innerHTML = galleryHtml;
  if (els.modelGalleryPage) {
    els.modelGalleryPage.innerHTML = galleryHtml;
  }
}

function renderMediaPackCards() {
  const modelPacks = getAllModelPacks();
  return modelPacks
    .map((pack) => {
      return `
        <button class="model-card model-pack-card" type="button" data-pack-id="${escapeAttribute(pack.id)}">
          <span class="model-card-preview" data-fallback="Adicionar capa">
            <img src="${escapeAttribute(pack.cover)}" alt="${escapeAttribute(pack.title)}" loading="lazy" onerror="this.parentElement.classList.add('is-empty'); this.remove();" />
            <span class="media-badge">Pack</span>
            <span class="media-lock" aria-hidden="true">+</span>
            <span class="media-price">${escapeHtml(pack.price || "R$ 49")}</span>
          </span>
          <span>${escapeHtml(pack.title)}</span>
          <small>${escapeHtml(pack.model)} - ${escapeHtml(pack.description)}</small>
        </button>
      `;
    })
    .join("");
}

function renderPackMedia(pack, origin) {
  return `
    <div class="model-gallery-header">
      <button class="ghost-button" type="button" data-pack-back>Voltar</button>
      <div>
        <strong>${escapeHtml(pack.title)}</strong>
        <span>${escapeHtml(pack.description)}</span>
      </div>
    </div>
    ${pack.media
      .map((item) => {
        const publicUrl = item.path.startsWith("data:") || item.path.startsWith("blob:") ? item.path : `${origin}/${item.path}`;
        const preview =
          item.type === "video"
            ? `<span class="model-card-preview" data-fallback="Adicionar video"><video src="${escapeAttribute(item.path)}" preload="metadata" muted playsinline onerror="this.parentElement.classList.add('is-empty'); this.remove();"></video><span class="media-badge">Video</span><span class="media-lock" aria-hidden="true">▷</span></span>`
            : `<span class="model-card-preview" data-fallback="Adicionar foto"><img src="${escapeAttribute(item.path)}" alt="${escapeAttribute(item.title)}" loading="lazy" onerror="this.parentElement.classList.add('is-empty'); this.remove();" /><span class="media-badge">Foto</span><span class="media-lock" aria-hidden="true">+</span></span>`;

        return `
          <button class="model-card" type="button" data-media-url="${escapeAttribute(publicUrl)}" data-media-type="${escapeAttribute(item.type)}">
            ${preview}
            <span>${escapeHtml(item.title)}</span>
            ${item.type === "video" ? "<small>Video</small>" : "<small>Foto</small>"}
          </button>
        `;
      })
      .join("")}
  `;
}

function renderSyncStatus(text) {
  if (!els.syncStatus) return;

  if (text) {
    els.syncStatus.textContent = text;
    return;
  }

  if (!state.apiEnabled) {
    els.syncStatus.textContent = "Local";
    return;
  }

  if (!state.lastSyncAt) {
    els.syncStatus.textContent = "Online";
    return;
  }

  els.syncStatus.textContent = `Online ${new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(state.lastSyncAt)}`;
}

function render() {
  if (!state.activeLeadId && state.leads.length) {
    state.activeLeadId = state.leads[0].id;
  }

  renderMetrics();
  renderStageTabs();
  renderLeadList();
  renderLeadTable();
  renderStageSelect();
  renderModelGallery();
  renderLeadDetails();
  renderDataDashboard();
  renderSyncStatus();
  renderActiveView();
}

async function persistLeadUpdate(lead, patch) {
  Object.assign(lead, patch);

  if (state.apiEnabled) {
    await api(`/api/leads/${encodeURIComponent(lead.id)}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  } else {
    saveLocalLeads();
  }
}

async function addMessage(text, mediaUrl = "") {
  const lead = getActiveLead();
  if (!lead || (!text.trim() && !mediaUrl.trim())) return;
  const mediaType = getMediaTypeFromUrl(mediaUrl);

  const message = {
    id: `msg-${Date.now()}`,
    from: "agent",
    text: text.trim(),
    mediaUrl: mediaUrl.trim(),
    mediaType,
    status: "sending",
    at: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
  };

  lead.messages.push(message);
  lead.activities = lead.activities.filter((activity) => activity !== "Fazer primeiro contato");
  render();

  if (state.apiEnabled) {
    try {
      const result = await api(`/api/leads/${encodeURIComponent(lead.id)}/messages`, {
        method: "POST",
        body: JSON.stringify({
          direction: "outbound",
          text: message.text,
          mediaUrl: message.mediaUrl,
          mediaType: message.mediaType,
          provider: "meta",
        }),
      });
      message.status = result.status || "sent";
      message.providerError = result.providerError || "";
      await refreshLeads({ force: true });
    } catch (error) {
      message.status = "failed";
      message.providerError = error.message;
      render();
    }
  } else {
    message.status = "stored";
    saveLocalLeads();
    render();
  }
}

async function addClientReply(text) {
  const lead = getActiveLead();
  const cleanText = String(text || "").trim();
  if (!lead || !cleanText) return;

  lead.messages.push({
    id: `msg-${Date.now()}`,
    from: "client",
    text: cleanText,
    at: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
  });

  if (state.apiEnabled) {
    await api(`/api/leads/${encodeURIComponent(lead.id)}/messages`, {
      method: "POST",
      body: JSON.stringify({
        direction: "inbound",
        text: cleanText,
        provider: "crm-simulator",
      }),
    });
    await refreshLeads({ force: true });
  } else {
    saveLocalLeads();
    render();
    addAutomaticReply(lead, cleanText);
  }
}

function addAutomaticReply(lead, inboundText = "") {
  if (!lead || state.apiEnabled) return;

  window.setTimeout(() => {
    const currentLead = state.leads.find((item) => item.id === lead.id);
    if (!currentLead) return;

    const replies = buildLiaReplies(currentLead, inboundText);
    replies.forEach((reply, index) => {
      currentLead.messages.push({
        id: `msg-${Date.now()}-${index}`,
        from: "agent",
        text: reply.text,
        mediaUrl: reply.mediaUrl || "",
        mediaType: reply.mediaType || null,
        status: "stored",
        at: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      });
    });
    currentLead.activities = currentLead.activities.filter((activity) => activity !== "Fazer primeiro contato");
    saveLocalLeads();
    render();
  }, 700);
}

function buildLiaReplies(lead, inboundText = "") {
  const messages = inboundText
    ? [...lead.messages, { from: "client", text: inboundText }]
    : lead.messages;
  const lastInbound = [...messages].reverse().find((message) => message.from === "client") || {};
  const text = normalizeText(lastInbound.text);
  const name = firstName(lead.name);
  const outbound = messages.filter((message) => message.from === "agent");
  const ageDecision = classifyAgeReply(text);
  const isAdult = lead.tags.includes("maior18_confirmado") || ageDecision === "adult";
  const isMinor = lead.tags.includes("menor18_bloqueado") || ageDecision === "minor";
  const packChoice = classifyPackReply(text);
  const vibeAsked = outbound.some((message) => normalizeText(message.text).includes("voce gosta de um clima"));
  const preferenceAsked = outbound.some((message) => normalizeText(message.text).includes("o que te prende mais numa foto"));
  const promiseAsked = outbound.some((message) => normalizeText(message.text).includes("me promete que vai me falar sinceramente"));
  const sampleSent = outbound.some((message) => isSampleMessage(message));
  const offersSent = outbound.some((message) => normalizeText(message.text).includes("escolhe teu pack") || normalizeText(message.text).includes("10 fotos"));

  if (ageDecision) {
    lead.tags = lead.tags.filter((tag) => tag !== "maior18_confirmado" && tag !== "menor18_bloqueado");
    lead.tags.push(ageDecision === "adult" ? "maior18_confirmado" : "menor18_bloqueado");
  }

  if (isMinor) {
    return [{ text: "Obrigada por ser sincero comigo. Meu conteudo e so para maiores de 18 anos, entao vou encerrar por aqui." }];
  }

  if (!isAdult) {
    return [
      {
        text: `Antes de eu me soltar com voce${name}, preciso confirmar uma coisa: meu conteudo e adulto e exclusivo para maiores de 18 anos. Voce confirma que e maior de 18?`,
      },
    ];
  }

  if (hasAny(text, ["nao", "não", "parar", "cancelar", "sair"])) {
    return [{ text: "Tudo bem. Vou respeitar teu momento e pausar por aqui. Quando quiser voltar, me chama." }];
  }

  if (packChoice) {
    return [buildCheckoutMessage(name, packChoice)];
  }

  if (!vibeAsked) {
    return [buildVibeMessage(name)];
  }

  if (!preferenceAsked) {
    return [buildPreferenceMessage(name, text)];
  }

  if (!promiseAsked) {
    return [buildPromiseMessage(name, text)];
  }

  if (sampleSent && !readyToSell(messages, text)) {
    return [buildAfterSampleTease(name, messages)];
  }

  if (sampleSent && wantsMore(text)) {
    return [buildOffersMessage(name)];
  }

  if (sampleSent && hasAny(text, ["valor", "preco", "preço", "plano", "pacote", "pack", "packs", "assinar", "assinatura", "comprar"])) {
    return [buildOffersMessage(name)];
  }

  if (!sampleSent && shouldWarmLead(text, messages)) {
    return [
      buildSampleMessage(name, getPublicPhotoUrl(liaSampleImagePath)),
    ];
  }

  if (offersSent && hasAny(text, ["10", "30", "20", "video", "vídeo", "59", "39", "19"])) {
    return [{ text: `Adorei que voce esta escolhendo${name}. Me fala qual combina mais com a tua vontade agora: 10 fotos, 30 fotos ou 20 fotos + 1 video?` }];
  }

  return [{ text: buildConversationNudge(name, text, messages) }];
}

function buildLiaReply(lead, inboundText = "") {
  return buildLiaReplies(lead, inboundText)[0]?.text || "";
}

async function createLead(formData) {
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  const payload = {
    name: String(formData.get("name")),
    phone: String(formData.get("phone")),
    interest: String(formData.get("interest")),
    source: String(formData.get("source")),
    tags,
  };

  let lead;
  if (state.apiEnabled) {
    lead = await api("/api/leads", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } else {
    lead = {
      id: `lead-${Date.now()}`,
      ...payload,
      stage: "novo",
      notes: "",
      activities: ["Fazer primeiro contato"],
      messages: [{ id: `msg-${Date.now()}`, from: "client", text: "Novo contato cadastrado no CRM.", at: "agora" }],
    };
  }

  state.leads.unshift(lead);
  state.activeLeadId = lead.id;
  state.activeStage = "todos";
  if (!state.apiEnabled) saveLocalLeads();
  render();
  addAutomaticReply(lead, `${lead.interest} ${lead.source}`);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

function firstName(name) {
  const value = String(name || "").trim().split(/\s+/)[0] || "";
  return value && !/^\+?\d+$/.test(value) ? `, ${value}` : "";
}

function getLastMessage(lead) {
  return [...(lead.messages || [])].reverse().find((message) => message.text || message.mediaUrl || message.media_url) || null;
}

function getLeadProfile(lead) {
  const inbound = (lead.messages || [])
    .filter((message) => message.from === "client")
    .map((message) => normalizeText(message.text || ""))
    .join(" ");

  const preference = [
    hasAny(inbound, ["provocante", "provocar", "safada", "safadinha"]) ? "Provocante" : "",
    hasAny(inbound, ["carinho", "carinhoso", "meiga", "fofa"]) ? "Carinhoso" : "",
    hasAny(inbound, ["ousada", "ousado", "quente"]) ? "Ousado" : "",
    hasAny(inbound, ["conversar", "palavras", "fala comigo"]) ? "Conversa antes" : "",
  ].filter(Boolean)[0] || "Ainda descobrindo";

  const format = [
    hasAny(inbound, ["audio", "voz", "te ouvir"]) ? "Audio" : "",
    hasAny(inbound, ["foto", "imagem", "amostra", "me mostra"]) ? "Foto/imagem" : "",
    hasAny(inbound, ["video", "vídeo"]) ? "Video" : "",
  ].filter(Boolean)[0] || "Nao definido";

  const buyingSignal = hasAny(inbound, ["preco", "preço", "valor", "quanto", "pack", "pacote", "comprar"])
    ? "Perguntou valor"
    : hasAny(inbound, ["quero mais", "gostei", "manda mais", "ver mais"])
      ? "Quer ver mais"
      : "Frio/morno";

  return { preference, format, buyingSignal };
}

function getAgeStatusLabel(lead) {
  if (lead.tags.includes("maior18_confirmado")) return "18+ confirmado";
  if (lead.tags.includes("menor18_bloqueado")) return "menor bloqueado";
  return "aguardando 18+";
}

function classifyAgeReply(text) {
  const value = normalizeText(text);
  if (hasAny(value, ["sou maior de 18", "maior de 18", "tenho 18", "+18", "18+", "sim sou maior", "sou maior", "maior18"])) {
    return "adult";
  }
  if (hasAny(value, ["sou menor de 18", "menor de 18", "tenho menos", "sou menor", "menor18", "nao sou maior", "não sou maior"])) {
    return "minor";
  }
  return null;
}

function classifyPackReply(text) {
  const value = normalizeText(text);
  if (hasAny(value, ["pack_10_fotos", "10 fotos", "19,90", "19.90"])) return "pack_10_fotos";
  if (hasAny(value, ["pack_30_fotos", "30 fotos", "39,90", "39.90"])) return "pack_30_fotos";
  if (hasAny(value, ["pack_20_fotos_1_video", "20 fotos", "video", "vídeo", "59,90", "59.90"])) return "pack_20_fotos_1_video";
  return null;
}

function inferPackChoiceFromLead(lead) {
  const messages = [...(lead?.messages || [])].reverse();
  for (const message of messages) {
    const choice = classifyPackReply(`${message.text || ""} ${message.mediaUrl || ""}`);
    if (choice) return choice;
  }
  return null;
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(normalizeText(term)));
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function shouldWarmLead(text, messages) {
  const inboundCount = messages.filter((message) => message.from === "client").length;
  if (inboundCount < 4) return false;
  return hasAny(text, ["foto", "fotos", "modelo", "modelos", "ver", "manda", "enviar", "sim", "aceito", "quero", "pode", "ok", "prometo", "sincero"]);
}

function wantsMore(text) {
  return hasAny(text, ["mais", "ver mais", "quero", "sim", "gostei", "manda", "pode", "pack", "pacote", "valor", "preco", "preço"]);
}

function buildOffersMessage(name) {
  return {
    text: `Gostou${name}? Escolhe teu pack que eu separo pra voce:`,
    packs: liaPacks,
  };
}

function buildVibeMessage(name) {
  return {
    text: `Pronto${name}. Agora posso ficar mais a vontade. Me conta uma coisa: voce gosta de um clima mais carinhoso, mais provocante ou mais ousado? Quero acertar teu gosto antes de te mostrar qualquer coisa.`,
  };
}

function buildPreferenceMessage(name, text) {
  const hook = hasAny(text, ["provocante", "ousada", "ousado"])
    ? "Gosto de quem fala assim, sem muita enrolacao."
    : "Gostei do teu jeito.";

  return {
    text: `${hook} Me diz o que te prende mais numa foto${name}: olhar, pose, sorriso, corpo inteiro ou aquele misterio de deixar vontade de ver mais?`,
  };
}

function buildPromiseMessage(name, text) {
  const touch = hasAny(text, ["olhar", "sorriso"])
    ? "Entao vou caprichar nesse olhar pra te provocar devagar."
    : "Entao vou escolher uma amostra que tenha esse clima.";

  return {
    text: `${touch} Antes de eu mandar, me promete que vai me falar sinceramente se ficou com vontade de ver mais?`,
  };
}

function buildSampleMessage(name, sampleUrl) {
  return {
    text: `Gostei do que voce me contou${name}. Separei uma amostrinha gratis minha pra voce sentir o clima. Se quiser mais, me fala "quero ver mais".`,
    mediaUrl: sampleUrl,
    mediaType: "image",
  };
}

function buildCheckoutMessage(name, packId) {
  const pack = liaPacks.find((item) => item.id === packId) || liaPacks[0];
  return {
    text: `Delicia${name}. Vou separar o pack "${pack.title}" por ${pack.description}. Me confirma que e esse mesmo e eu te passo o proximo passo.`,
  };
}

function buildAfterSampleTease(name, messages) {
  const count = countInboundAfterSample(messages);
  if (count <= 1) {
    return {
      text: `Adorei que voce pediu mais${name}. Mas me fala primeiro: o que mais te chamou atencao nessa amostra? Quero saber onde eu acertei em voce.`,
    };
  }

  if (count === 2) {
    return {
      text: `Ta ficando gostoso conversar com voce${name}. Se eu fosse separar um pack pensando no teu gosto, voce ia querer algo mais leve, mais provocante ou mais ousado?`,
    };
  }

  return { text: `Agora eu ja entendi melhor teu clima${name}. Se quiser, eu te mostro os packs que combinam com essa vontade.` };
}

function readyToSell(messages, text) {
  const afterSample = countInboundAfterSample(messages);
  if (afterSample < 3) return false;
  if (hasAny(text, ["valor", "preco", "preço", "plano", "pacote", "pack", "packs", "comprar", "quanto"])) return true;
  return afterSample >= 4 && wantsMore(text);
}

function countInboundAfterSample(messages) {
  const sampleIndex = messages.findIndex(
    (message) =>
      message.from === "agent" &&
      isSampleMessage(message)
  );
  if (sampleIndex < 0) return 0;
  return messages.slice(sampleIndex + 1).filter((message) => message.from === "client").length;
}

function isSampleMessage(message) {
  const mediaUrl = String(message.mediaUrl || message.media_url || "");
  const mediaType = String(message.mediaType || message.media_type || "");
  return (
    message.from === "agent" &&
    (normalizeText(message.text).includes("amostrinha gratis") ||
      mediaUrl.includes("modelo-01") ||
      mediaUrl.includes("lia-amostra") ||
      mediaType === "image" ||
      /\.(png|jpe?g|webp)(\?|$)/i.test(mediaUrl))
  );
}

function buildConversationNudge(name, text, messages) {
  const inboundCount = messages.filter((message) => message.from === "client").length;

  if (hasAny(text, ["valor", "preco", "preço", "pack", "pacote", "quanto"])) {
    return `Eu te mostro os valores ja ja${name}, mas antes quero entender teu gosto pra separar algo que combine contigo. Voce prefere um clima mais carinhoso, provocante ou ousado?`;
  }

  if (inboundCount <= 3) {
    return `Calma${name}, gosto de sentir a conversa primeiro. Me conta: voce veio mais pela curiosidade, pela vontade de ver foto, ou porque curte conversar antes?`;
  }

  return `To gostando desse papo${name}. Me da mais uma pista do que voce curte e eu escolho uma amostra com a tua cara.`;
}

function getPublicPhotoUrl(path) {
  const origin = getPublicOrigin();
  return origin ? `${origin}/${path}` : path;
}

function getMediaTypeFromUrl(url) {
  const value = String(url || "").trim();
  if (!value) return null;
  if (/\.(mp4|webm|mov)(\?|$)/i.test(value)) return "video";
  if (value.startsWith("data:video/")) return "video";
  return "image";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

async function createMediaPack(formData) {
  const files = Array.from(formData.getAll("files")).filter((file) => file && file.size);
  if (!files.length) return;

  const title = String(formData.get("title") || "").trim();
  const model = String(formData.get("model") || "").trim();
  const price = String(formData.get("price") || "R$ 49").trim();

  if (state.apiEnabled) {
    try {
      const response = await fetch("/api/packs", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const pack = await response.json();
        state.mediaPacks.unshift(pack);
        state.activeMediaPackId = null;
        renderModelGallery();
        renderDataDashboard();
        return;
      }
    } catch {
      // Continua para o fallback local.
    }
  }

  const media = [];

  for (const [index, file] of files.entries()) {
    const dataUrl = await readFileAsDataUrl(file);
    const type = file.type.startsWith("video/") ? "video" : "image";
    media.push({
      id: `upload-${Date.now()}-${index}`,
      title: `${type === "video" ? "Video" : "Foto"} ${String(index + 1).padStart(2, "0")}`,
      path: dataUrl,
      type,
    });
  }

  const pack = {
    id: `custom-pack-${Date.now()}`,
    model,
    title,
    description: `${media.filter((item) => item.type === "image").length} fotos e ${media.filter((item) => item.type === "video").length} videos`,
    price,
    cover: media.find((item) => item.type === "image")?.path || media[0]?.path || "",
    media,
    custom: true,
  };

  state.mediaPacks.unshift(pack);
  saveLocalPacks();
  state.activeMediaPackId = null;
  renderModelGallery();
}

function getPublicOrigin() {
  const origin = window.location.origin;
  return !origin || origin === "null" || origin === "file://" ? "" : origin;
}

els.searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderLeadList();
});

els.viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.activeView = button.dataset.view;
    renderActiveView();
  });
});

els.stageTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stage]");
  if (!button) return;
  state.activeStage = button.dataset.stage;
  render();
});

els.leadList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-lead-id]");
  if (!card) return;
  state.activeLeadId = card.dataset.leadId;
  render();
});

if (els.leadTableBody) {
  els.leadTableBody.addEventListener("click", (event) => {
    const row = event.target.closest("[data-lead-row-id]");
    if (!row) return;
    state.activeLeadId = row.dataset.leadRowId;
    state.activeView = "dados";
    render();
  });
}

if (els.pipelineBoard) {
  els.pipelineBoard.addEventListener("click", (event) => {
    const card = event.target.closest("[data-lead-row-id]");
    if (!card) return;
    state.activeLeadId = card.dataset.leadRowId;
    state.activeView = "atendimento";
    render();
  });
}

els.modelGallery.addEventListener("click", (event) => {
  handleGalleryClick(event, { openChat: false });
});

if (els.modelGalleryPage) {
  els.modelGalleryPage.addEventListener("click", (event) => {
    handleGalleryClick(event, { openChat: true });
  });
}

function handleGalleryClick(event, { openChat = false } = {}) {
  const backButton = event.target.closest("[data-pack-back]");
  if (backButton) {
    state.activeMediaPackId = null;
    renderModelGallery();
    return;
  }

  const packCard = event.target.closest("[data-pack-id]");
  if (packCard) {
    state.activeMediaPackId = packCard.dataset.packId;
    renderModelGallery();
    return;
  }

  const mediaCard = event.target.closest("[data-media-url]");
  if (!mediaCard) return;

  els.mediaInput.value = mediaCard.dataset.mediaUrl;
  if (openChat) {
    state.activeView = "chat";
    renderActiveView();
  }
  els.messageInput.focus();
}

els.chatFeed.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pack-id]");
  if (!button) return;
  els.messageInput.value = button.dataset.reply;
  els.messageInput.focus();
});

els.messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await addMessage(els.messageInput.value, els.mediaInput.value);
  els.messageInput.value = "";
  els.mediaInput.value = "";
});

document.querySelectorAll("[data-reply]").forEach((button) => {
  button.addEventListener("click", async () => {
    const reply = button.dataset.reply;
    if (classifyAgeReply(reply)) {
      els.messageInput.value = "";
      els.mediaInput.value = "";
      await addClientReply(reply);
      return;
    }

    els.messageInput.value = reply;
    els.messageInput.focus();
  });
});

els.stageSelect.addEventListener("change", async (event) => {
  const lead = getActiveLead();
  if (!lead) return;
  await persistLeadUpdate(lead, { stage: event.target.value });
  render();
});

els.markDoneButton.addEventListener("click", async () => {
  const lead = getActiveLead();
  if (!lead) return;
  await persistLeadUpdate(lead, { stage: "ganho", activities: ["Venda marcada como ganha"] });
  render();
});

els.saveNoteButton.addEventListener("click", async () => {
  const lead = getActiveLead();
  if (!lead) return;
  await persistLeadUpdate(lead, { notes: els.noteInput.value });
  render();
});

if (els.sendAudioPreviewButton) {
  els.sendAudioPreviewButton.addEventListener("click", async () => {
    const lead = getActiveLead();
    if (!lead || !state.apiEnabled) return;

    renderSyncStatus("Enviando audio...");
    try {
      await api(`/api/leads/${encodeURIComponent(lead.id)}/audio`, {
        method: "POST",
        body: JSON.stringify({
          text: `Oi, ${lead.name.split(/\s+/)[0] || ""}. Vou te mandar uma previa rapidinha em audio do clima do pack.`,
        }),
      });
      await refreshLeads({ force: true });
    } catch {
      renderSyncStatus("Audio falhou");
    }
  });
}

if (els.sendTemplateButton) {
  els.sendTemplateButton.addEventListener("click", async () => {
    const lead = getActiveLead();
    if (!lead || !state.apiEnabled) return;

    renderSyncStatus("Enviando template...");
    try {
      await api(`/api/leads/${encodeURIComponent(lead.id)}/template`, {
        method: "POST",
        body: JSON.stringify({ templateId: "reengagement" }),
      });
      await refreshLeads({ force: true });
    } catch (error) {
      renderSyncStatus("Template falhou");
      alert(`Nao foi possivel enviar template: ${error.message}`);
      await refreshLeads({ force: true });
    }
  });
}

if (els.submitTemplatesButton) {
  els.submitTemplatesButton.addEventListener("click", async () => {
    if (!state.apiEnabled) return;

    renderSyncStatus("Submetendo templates...");
    try {
      const result = await api("/api/templates", { method: "POST" });
      const failed = (result.results || []).filter((item) => !item.ok);
      renderSyncStatus(failed.length ? "Template pendente" : "Template submetido");
      alert(failed.length ? failed.map((item) => `${item.template}: ${item.error}`).join("\n") : "Template submetido para aprovacao da Meta.");
    } catch (error) {
      renderSyncStatus("Template falhou");
      alert(`Nao foi possivel submeter templates: ${error.message}`);
    }
  });
}

if (els.requestCallButton) {
  els.requestCallButton.addEventListener("click", async () => {
    const lead = getActiveLead();
    if (!lead || !state.apiEnabled) return;

    renderSyncStatus("Solicitando ligacao...");
    try {
      await api(`/api/leads/${encodeURIComponent(lead.id)}/call`, { method: "POST" });
      await refreshLeads({ force: true });
    } catch {
      renderSyncStatus("Ligacao falhou");
    }
  });
}

if (els.createPixButton) {
  els.createPixButton.addEventListener("click", async () => {
    const lead = getActiveLead();
    if (!lead || !state.apiEnabled) return;

    renderSyncStatus("Gerando pagamento...");
    try {
      await api("/api/payments/asaas", {
        method: "POST",
        body: JSON.stringify({
          contactId: lead.id,
          packId: inferPackChoiceFromLead(lead) || "pack_30_fotos",
        }),
      });
      await refreshLeads({ force: true });
    } catch (error) {
      renderSyncStatus("Pagamento falhou");
      alert(`Nao foi possivel gerar pagamento: ${error.message}`);
    }
  });
}

els.newLeadButton.addEventListener("click", () => {
  els.leadDialog.showModal();
});

if (els.newLeadButtonAlt) {
  els.newLeadButtonAlt.addEventListener("click", () => {
    els.leadDialog.showModal();
  });
}

els.leadForm.addEventListener("submit", async (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  await createLead(new FormData(els.leadForm));
  els.leadForm.reset();
  els.leadDialog.close();
});

if (els.packForm) {
  els.packForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await createMediaPack(new FormData(els.packForm));
      els.packForm.reset();
    } catch (error) {
      alert("Nao foi possivel salvar este pack no navegador. Tente arquivos menores ou configure R2 para upload permanente.");
    }
  });
}

async function init() {
  state.mediaPacks = loadLocalPacks();
  renderStageSelect();
  render();
  await loadLeads();
  await loadPacks();
  state.loading = false;
  render();
  window.setInterval(refreshLeads, 4000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshLeads();
  });
}

init();
