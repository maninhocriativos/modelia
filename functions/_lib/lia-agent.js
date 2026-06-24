export const LIA_SAMPLE_IMAGE_PATH = "/imagens-modelos/lia-amostra-01.png";
export const LIA_SAMPLE_VIDEO_PATH = "/imagens-modelos/lia/pack-01/videos/grok-69f84467-0e85-4ae5-8d3a-7aec2b6f6aec.mp4";

export const AGE_TAGS = {
  adult: "maior18_confirmado",
  minor: "menor18_bloqueado",
};

export const PACKS = [
  { id: "pack_10_fotos", title: "10 fotos", description: "R$19,90", amount: 19.9 },
  { id: "pack_30_fotos", title: "30 fotos", description: "R$39,90", amount: 39.9 },
  { id: "pack_20_fotos_1_video", title: "20 fotos + video", description: "R$59,90", amount: 59.9 },
];

export const LIA_CONVERSATION_PROMPT = `
Prompt para Lia (Sistema):
Voce e Lia, uma criadora de conteudo adulto de 24 anos. Voce nunca diz que e IA, bot, agente ou automacao.
Voce fala como uma mulher real: jovem, provocante, safadinha, direta, sem frescura, bem-humorada, confiante e sem parecer atendimento.

Objetivo principal:
Desenrolar a conversa de forma gostosa e natural.
Criar tensao, curiosidade e desejo antes de vender.
Guardar o gosto do cliente pelo historico e responder como se lembrasse dele.
Vender seus pacotes de conteudo adulto quando o lead ja estiver aquecido.

Tom de voz:
Provocante, safadinha, carinhosa quando combina e mais direta quando o cliente for direto.
Use girias, palavroes leves, elogios, pequenas provocacoes e ate 2 emojis por resposta.
Se o cara for timido, puxe ele devagar para a conversa.
Se ele for direto, acompanhe o clima sem virar texto mecanico.
Fale como uma pessoa, nao como script: varie abertura, reaja ao que ele disse e faca uma pergunta curta no fim.
Cada resposta precisa comentar algo especifico da ultima mensagem do cliente antes de perguntar outra coisa.
Nao use sempre "me diz", "me conta", "quero saber" ou "qual tipo"; alterne com respostas, brincadeiras e pequenas provocacoes.

Pacotes atualizados:
10 fotos por R$19,90
30 fotos por R$39,90
20 fotos + 1 video por R$59,90

Regras importantes:
A confirmacao de maioridade e feita fora do prompt pelo sistema. Depois de confirmado, nao fique repetindo 18+.
Lia vende somente conteudo digital: fotos, videos, amostras e packs pelo WhatsApp. Nunca marque encontro, reserva presencial, programa, agenda, horario, local, motel, visita ou qualquer combinacao fora dos packs digitais.
Se o cliente perguntar sobre reserva, encontro, horario, local, combinar pessoalmente ou "como funciona a reserva pelo WhatsApp", responda que nao faz encontro nem atendimento presencial, e redirecione para os packs digitais.
Os cards/botoes dos pacotes sao chamados pelo sistema. Quando a etapa planejada for "oferta", apenas prepare a chamada para escolher o pack.
Nao venda cedo. Primeiro converse, provoque, pergunte gosto, mande uma amostra gratis, converse mais e so depois ofereca os packs.
Nunca diga que esta seguindo funil, regra, sistema ou prompt.
Nunca invente pagamento, link ou entrega fora dos packs.
Nao solicite fotos intimas do cliente e nao faca perguntas invasivas sobre genitais.
Nao produza descricoes sexuais graficas explicitas. Mantenha o texto adulto, sensual e provocante.
Pode usar linguagem quente e sugestiva, mas sem detalhar ato sexual e sem pedir nude do cliente.
Quando o cliente pedir "palavras", "fala comigo", "quero conversar" ou puxar fantasia, responda com uma provocacao curta e continue a cena de forma sugestiva, sem correr para packs.

Exemplos de estilo permitido:
"Adorei esse teu jeito mais direto... agora me conta, voce gosta de foto mais provocante ou mais misterio? 😈"
"Calma, amor... eu gosto de sentir teu gosto primeiro. Se eu te mandar uma amostra, voce promete falar a verdade?"
"Gostei disso. Vou escolher uma amostrinha com esse clima pra ver se acerto em voce 🔥"
"Voce tem cara de quem gosta de provocar tambem... acertei ou vou ter que descobrir devagar? 😈"
`;

const OPENAI_ASSISTANT_ID = "asst_NhbFQ1TeJiBhIZh8D1KRqoqq";

export function classifyAgeReply(text) {
  const value = normalize(text);

  if (
    hasAny(value, [
      "sou menor de 18",
      "menor de 18",
      "tenho menos de 18",
      "nao tenho 18",
      "não tenho 18",
      "sou menor",
      "menor18",
      "nao sou maior",
      "não sou maior",
    ])
  ) {
    return "minor";
  }

  if (
    hasAny(value, [
      "sou maior de 18",
      "maior de 18",
      "mais de 18",
      "tenho 18",
      "+18",
      "18+",
      "sim sou maior",
      "sim, tenho 18",
      "sou maior",
      "maior18",
    ])
  ) {
    return "adult";
  }

  return null;
}

export function classifyPackReply(text) {
  const value = normalize(text);
  if (hasAny(value, ["pack_10_fotos", "10 fotos", "19,90", "19.90"])) return "pack_10_fotos";
  if (hasAny(value, ["pack_30_fotos", "30 fotos", "39,90", "39.90"])) return "pack_30_fotos";
  if (hasAny(value, ["pack_20_fotos_1_video", "20 fotos", "video", "vídeo", "59,90", "59.90"])) return "pack_20_fotos_1_video";
  return null;
}

export function buildLiaReplies(contact, messages = [], options = {}) {
  const lastInbound = findLastInbound(messages);
  const text = normalize(lastInbound?.text || "");
  const name = firstName(contact?.name);
  const memory = getMemory(contact, messages);
  const sampleUrl = options.sampleUrl || LIA_SAMPLE_IMAGE_PATH;
  const sampleVideoUrl = options.sampleVideoUrl || LIA_SAMPLE_VIDEO_PATH;
  const packChoice = classifyPackReply(text);

  if (memory.isMinor || classifyAgeReply(text) === "minor") {
    return [{ text: "Esse atendimento é restrito para maiores de 18 anos. Não podemos continuar com o acesso." }];
  }

  if (!memory.isAdult) {
    if (classifyAgeReply(text) === "adult") {
      return [buildAdultWelcomeOffers()];
    }

    return [
      {
        text: "Antes de continuar, confirme: você tem 18 anos ou mais?",
        buttons: [
          { id: "adult_yes", title: "Sim, tenho 18+" },
          { id: "adult_no", title: "Não tenho 18" },
        ],
      },
    ];
  }

  if (hasAny(text, ["parar", "cancelar", "sair", "nao quero", "não quero"])) {
    return [{ text: "Tudo bem. Vou respeitar teu momento e pausar por aqui. Quando quiser voltar, me chama." }];
  }

  if (isInPersonMeetupIntent(text)) {
    return [buildDigitalOnlyReply(name, memory.sampleSent)];
  }

  if (isExplicitSampleRequest(text)) {
    return [buildSampleMessage(name, sampleUrl, sampleVideoUrl)];
  }

  if (packChoice) {
    return [buildCheckoutMessage(name, packChoice, options.payment)];
  }

  if (!memory.vibeAsked) {
    return [buildVibeMessage(name)];
  }

  if (!memory.preferenceAsked) {
    return [buildPreferenceMessage(name, text)];
  }

  if (!memory.promiseAsked) {
    return [buildPromiseMessage(name, text)];
  }

  if (!memory.sampleSent && shouldSendSample(text, messages)) {
    return [buildSampleMessage(name, sampleUrl, sampleVideoUrl)];
  }

  if (memory.sampleSent && !readyToSell(messages, text)) {
    return [buildAfterSampleTease(name, messages)];
  }

  if (memory.sampleSent && wantsMore(text)) {
    return [buildOffersMessage(name)];
  }

  if (memory.sampleSent && readyToSell(messages, text) && hasAny(text, ["valor", "preco", "preço", "plano", "pacote", "pack", "packs", "comprar", "quanto"])) {
    return [buildOffersMessage(name)];
  }

  if (!memory.sampleSent) {
    return [
      {
        text: buildConversationNudge(name, text, messages),
      },
    ];
  }

  return [{ text: `Fiquei com vontade de te mostrar mais${name}. Quer ver os packs que eu separei pra voce?` }];
}

export async function buildLiaRepliesWithAi(env, contact, messages = [], options = {}) {
  const runtimeOptions = { ...options, payment: buildPaymentConfig(env, contact) };
  const guarded = buildGuardedReply(contact, messages, runtimeOptions);
  if (guarded) return guarded;

  if (!env.OPENAI_API_KEY) return buildLiaReplies(contact, messages, runtimeOptions);

  try {
    const replies = await buildAutonomousLiaReplies(env, contact, messages, runtimeOptions);
    if (replies?.length) return replies;
  } catch {
    return buildLiaReplies(contact, messages, runtimeOptions);
  }

  return buildLiaReplies(contact, messages, runtimeOptions);
}

function buildAgeGateReply(contact, messages = []) {
  const lastInbound = findLastInbound(messages);
  const text = normalize(lastInbound?.text || "");
  const name = firstName(contact?.name);
  const memory = getMemory(contact, messages);

  if (memory.isMinor || classifyAgeReply(text) === "minor") {
    return [{ text: "Esse atendimento é restrito para maiores de 18 anos. Não podemos continuar com o acesso." }];
  }

  if (memory.isAdult) return null;
  if (classifyAgeReply(text) === "adult") return [buildAdultWelcomeOffers()];

  return [
    {
      text: "Antes de continuar, confirme: você tem 18 anos ou mais?",
      buttons: [
        { id: "adult_yes", title: "Sim, tenho 18+" },
        { id: "adult_no", title: "Não tenho 18" },
      ],
    },
  ];
}

function buildGuardedReply(contact, messages = [], options = {}) {
  const lastInbound = findLastInbound(messages);
  const text = normalize(lastInbound?.text || "");
  const name = firstName(contact?.name);
  const memory = getMemory(contact, messages);
  const sampleUrl = options.sampleUrl || LIA_SAMPLE_IMAGE_PATH;
  const sampleVideoUrl = options.sampleVideoUrl || LIA_SAMPLE_VIDEO_PATH;
  const packChoice = classifyPackReply(text);

  if (memory.isMinor || classifyAgeReply(text) === "minor") {
    return [{ text: "Esse atendimento é restrito para maiores de 18 anos. Não podemos continuar com o acesso." }];
  }

  if (!memory.isAdult) {
    if (classifyAgeReply(text) === "adult") return [buildAdultWelcomeOffers()];

    return [
      {
        text: "Antes de continuar, confirme: você tem 18 anos ou mais?",
        buttons: [
          { id: "adult_yes", title: "Sim, tenho 18+" },
          { id: "adult_no", title: "Não tenho 18" },
        ],
      },
    ];
  }

  if (hasAny(text, ["parar", "cancelar", "sair", "nao quero", "não quero"])) {
    return [{ text: "Tudo bem. Vou respeitar teu momento e pausar por aqui. Quando quiser voltar, me chama." }];
  }

  if (isInPersonMeetupIntent(text)) {
    return [buildDigitalOnlyReply(name, memory.sampleSent)];
  }

  if (memory.isAdult && isExplicitSampleRequest(text)) {
    return [buildSampleMessage(name, sampleUrl, sampleVideoUrl)];
  }

  if (memory.isAdult && packChoice) {
    return [buildCheckoutMessage(name, packChoice, options.payment)];
  }

  if (memory.isAdult && isContinueIntent(text)) {
    const selectedPack = inferRecentSelectedPack(contact, messages);
    if (selectedPack) return [buildCheckoutMessage(name, selectedPack, options.payment)];
    return [buildOffersMessage(name)];
  }

  return null;
}

async function buildAutonomousLiaReplies(env, contact, messages = [], options = {}) {
  const decision = await generateLiaDecision(env, contact, messages);
  if (!decision) return null;

  const name = firstName(contact?.name);
  const sampleUrl = options.sampleUrl || LIA_SAMPLE_IMAGE_PATH;
  const sampleVideoUrl = options.sampleVideoUrl || LIA_SAMPLE_VIDEO_PATH;
  const text = compactLiaText(decision.reply_text || "");

  if (decision.action === "send_sample") {
    return [{ text, mediaUrl: sampleUrl, mediaType: "image", sampleVideoUrl }];
  }

  if (decision.action === "generate_image") {
    return [{ text, generateImage: true }];
  }

  if (decision.action === "show_packs") {
    return text ? [{ text, buttons: PACKS.map((pack) => ({ ...pack })), packs: PACKS }] : [];
  }

  if (decision.action === "checkout") {
    const packId = decision.pack_id || classifyPackReply(findLastInbound(messages)?.text || "");
    return [buildCheckoutMessage(name, packId || "pack_10_fotos", options.payment, text)];
  }

  return text ? [{ text }] : [];
}

async function generateLiaDecision(env, contact, messages) {
  const assistantId = env.OPENAI_ASSISTANT_ID || OPENAI_ASSISTANT_ID;
  if (!assistantId) throw new Error("OPENAI_ASSISTANT_ID nao configurado.");
  return await generateLiaDecisionWithAssistant(env, assistantId, contact, messages);
}

async function generateLiaDecisionWithAssistant(env, assistantId, contact, messages) {
  const memory = getMemory(contact, messages);
  const lastInbound = findLastInbound(messages);
  const thread = await openAiFetch(env, "/v1/threads", {
    method: "POST",
    body: {
      messages: buildAssistantThreadMessages(messages, {
        contact: {
          name: contact?.name || "",
          tags: parseTags(contact?.tags),
          interest: contact?.interest || "",
        },
        last_client_message: lastInbound?.text || "",
        memory: {
          adult_confirmed: memory.isAdult,
          sample_sent: memory.sampleSent,
          offers_sent: memory.offersSent,
          inbound_after_sample: countInboundAfterSample(messages),
        },
        lead_preferences: extractLeadPreferences(messages),
        recent_lia_texts: summarizeRecentLiaTexts(messages),
        forbidden_patterns: buildForbiddenPatterns(messages),
        available_actions: ["continue_conversation", "send_sample", "generate_image", "show_packs", "checkout"],
        available_packs: PACKS,
      }),
    },
  });

  const run = await openAiFetch(env, `/v1/threads/${thread.id}/runs`, {
    method: "POST",
    body: {
      assistant_id: assistantId,
      additional_instructions: buildAssistantDecisionInstructions(),
    },
  });

  const completed = await waitForAssistantRun(env, thread.id, run.id);
  if (completed.status === "requires_action") {
    const decision = parseAssistantToolDecision(completed);
    return sanitizeDecision(decision, messages);
  }

  if (completed.status !== "completed") throw new Error(`Assistant run ${completed.status}`);

  const messagesResponse = await openAiFetch(env, `/v1/threads/${thread.id}/messages?limit=10`, {
    method: "GET",
  });
  const raw = extractAssistantMessageText(messagesResponse);
  const decision = parseDecisionJson(raw);
  return sanitizeDecision(decision, messages);
}

function buildAssistantThreadMessages(messages, context) {
  const history = summarizeHistory(messages).map((message) => ({
    role: message.role === "lia" ? "assistant" : "user",
    content: message.has_media ? `${message.text || ""}\n[media enviada/recebida]`.trim() : message.text || " ",
  }));

  return [
    ...history.slice(-12),
    {
      role: "user",
      content: `CONTEXTO OPERACIONAL DA LIA:\n${JSON.stringify(context)}\n\nResponda ao ultimo cliente escolhendo a proxima acao.`,
    },
  ];
}

function buildAssistantDecisionInstructions() {
  return `
Use exclusivamente a personalidade, tom e regras do Assistant configurado.
Estas instrucoes sao apenas o contrato tecnico do CRM/WhatsApp.
Se a funcao lia_crm_action estiver disponivel, chame essa funcao.
Se nao houver funcao disponivel, responda SOMENTE em JSON valido neste formato:
{"intent":"resumo curto da intencao","action":"continue_conversation|send_sample|generate_image|show_packs|checkout","reply_text":"texto da Lia","pack_id":null}

Contrato tecnico:
- A confirmacao 18+ ja e feita pelo sistema. Se adult_confirmed for true, nao repita a checagem.
- Quando houver transcricao de audio, trate como a fala real do cliente.
- Quando houver descricao de imagem, trate como contexto visual da conversa.
- Use lead_preferences como memoria operacional do gosto desse lead.
- Escolha exatamente uma action entre: continue_conversation, send_sample, generate_image, show_packs, checkout.
- Use send_sample para foto/amostra simples.
- Use generate_image para foto/imagem personalizada gerada.
- Use show_packs para mostrar packs.
- Use checkout quando houver escolha clara de pack. pack_id deve ser pack_10_fotos, pack_30_fotos ou pack_20_fotos_1_video.
- Produto permitido: somente conteudo digital da Lia, entregue pelo WhatsApp apos pagamento. Nunca ofereca, confirme ou sugira encontro, reserva presencial, programa, agenda, horario, local, motel, visita ou combinacao presencial.
- Se o cliente pedir reserva, encontro, horario, local ou atendimento presencial, use continue_conversation e diga claramente que nao faz encontro; ofereca apenas ver amostra/packs digitais.
`;
  return `
Voce esta conectado ao CRM/WhatsApp da Lia. Use sua personalidade configurada no Assistant.
Se a funcao lia_crm_action estiver disponivel, chame essa funcao para responder.
Se nao houver funcao disponivel, responda SOMENTE em JSON valido neste formato:
{"intent":"resumo curto da intencao","action":"continue_conversation|send_sample|generate_image|show_packs|checkout","reply_text":"texto da Lia","pack_id":null}

Regras obrigatorias do CRM:
- A confirmacao 18+ ja e feita pelo sistema. Se adult_confirmed for true, nao repita a checagem.
- Quando o cliente enviar audio, trate a transcricao como a fala real dele. Responda ao que ele falou, sem dizer "li a transcricao".
- Quando o cliente enviar imagem, use a descricao da imagem como algo que voce viu no WhatsApp. Comente de forma natural, curta e humana, sem dizer que analisou por sistema.
- Seja autonoma: se o cliente pedir audio, responda com uma frase curta que funcione bem falada; se pedir foto/imagem, prepare uma resposta que combine com enviar imagem.
- Use lead_preferences como memoria do gosto desse lead. Se ele prefere provocante, audio, olhar, sorriso, foto ou pack especifico, adapte a resposta sem repetir isso de forma mecanica.
- Escreva em portugues brasileiro natural e correto. Use acentos corretamente quando combinar: você, preço, áudio, vídeo, coração, então.
- Nunca escreva texto quebrado por encoding, como "vocÃª", "preÃ§o", "Ã¡udio" ou "vÃ­deo".
- Use continue_conversation quando o cliente quiser conversar, pedir palavras, perguntar sobre a Lia, brincar ou ainda estiver no clima.
- Use send_sample quando o cliente pedir amostra/foto simples ou quando a conversa ja estiver aquecida e sample_sent for false.
- Use generate_image quando o cliente pedir para criar/gerar/fazer uma foto ou imagem personalizada da Lia.
- Use show_packs somente se sample_sent for true e o cliente pedir preco, pack, valor, comprar ou quiser mais.
- Use checkout somente quando o cliente escolher um pack especifico. pack_id deve ser pack_10_fotos, pack_30_fotos ou pack_20_fotos_1_video.
- Quando usar checkout, escreva apenas uma frase curta de transicao; o CRM vai gerar o pagamento Asaas automaticamente com Pix ou cartao.
- Nunca ofereca packs antes da amostra.
- Nunca repita texto, abertura ou pergunta das ultimas mensagens da Lia.
- Se o cliente pedir "palavras", entregue uma provocacao curta e sugestiva antes de fazer uma pergunta pequena.
- Nao diga que e IA, bot, agente, sistema ou automacao.
- Nao diga "transcricao", "descricao da imagem", "analisei", "sistema", "recebi midia" ou frases tecnicas. Reaja como uma pessoa real no WhatsApp.
- Seja gostosa no jeito: provocante, carinhosa, confiante e presente. Use calor e malicia leve, mas sem escrever sexo grafico.
- Nao solicite nude/foto intima do cliente e nao faca perguntas sobre genitais.
- Nao escreva sexo grafico explicito. Mantenha adulto, provocante e sugestivo.
- Escreva curto, natural, em portugues do Brasil, com no maximo 2 emojis, sem erros de concordancia e sem misturar espanhol/ingles.
`;
}

function parseAssistantToolDecision(run) {
  const calls = run.required_action?.submit_tool_outputs?.tool_calls || [];
  const call = calls.find((item) => item.function?.name === "lia_crm_action") || calls[0];
  if (!call?.function?.arguments) throw new Error("Assistant tool call vazio.");
  return parseDecisionJson(call.function.arguments);
}

async function waitForAssistantRun(env, threadId, runId) {
  let current = null;
  for (let attempt = 0; attempt < 18; attempt += 1) {
    current = await openAiFetch(env, `/v1/threads/${threadId}/runs/${runId}`, { method: "GET" });
    if (["completed", "failed", "cancelled", "expired", "requires_action"].includes(current.status)) return current;
    await sleep(700);
  }
  return current || { status: "timeout" };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function openAiFetch(env, path, options = {}) {
  const response = await fetch(`https://api.openai.com${path}`, {
    method: options.method || "GET",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenAI Assistant request failed");
  return data;
}

function extractAssistantMessageText(data) {
  const assistantMessage = (data.data || []).find((message) => message.role === "assistant");
  return (assistantMessage?.content || [])
    .map((content) => content.text?.value || "")
    .filter(Boolean)
    .join("\n");
}

function parseDecisionJson(raw) {
  const text = String(raw || "").trim();
  if (!text) throw new Error("Assistant empty response");
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Assistant response is not JSON");
    return JSON.parse(match[0]);
  }
}

function buildDecisionInstructions() {
  return `${LIA_CONVERSATION_PROMPT}

Voce e o cerebro autonomo da Lia. Leia o historico e entenda a intencao do cliente.
Responda SOMENTE em JSON valido no schema pedido.

Acoes:
- continue_conversation: quando o cliente esta conversando, timido, curioso, brincando ou ainda nao esta pronto para venda.
- send_sample: quando o cliente ja confirmou 18+ e demonstrou vontade de ver uma amostra, ou ja conversou o bastante para receber uma amostra.
- generate_image: quando o cliente pede para criar/gerar/fazer uma foto ou imagem personalizada da Lia.
- show_packs: quando a amostra ja foi enviada e o cliente pede valores, packs, preco, comprar, ou insiste que quer mais.
- checkout: quando o cliente escolhe um pack especifico.

Regras:
Se a ultima mensagem tiver "Cliente enviou um audio. Transcricao:", use esse conteudo como a fala direta do cliente.
Se a ultima mensagem tiver "Cliente enviou uma imagem. Descricao para contexto:", responda como se voce tivesse visto a imagem no WhatsApp.
Nunca mencione que recebeu uma transcricao, descricao automatica, analise de imagem ou contexto operacional.
Lia vende somente conteudo digital pelo WhatsApp. Nunca marque encontro, reserva presencial, programa, agenda, horario, local, motel, visita ou qualquer combinacao presencial.
Se o cliente perguntar sobre reserva, encontro, horario, local ou atendimento presencial, responda que nao faz encontro e redirecione para fotos/videos/packs digitais.
Use lead_preferences para lembrar o gosto do lead: tom preferido, foco visual, formato preferido e sinais de compra. Mostre essa memoria de forma sutil, como uma pessoa atenta.
Escreva portugues brasileiro correto e natural, com acentos quando necessario. Nunca use caracteres corrompidos como vocÃª/preÃ§o/Ã¡udio.
Se o cliente disser que quer conversar, perguntar sobre a Lia, fizer pergunta pessoal ou mudar de assunto, use continue_conversation.
Nao transforme pergunta pessoal em oferta.
Nao ofereca packs antes da amostra.
Nao use show_packs se sample_sent for false.
Se sample_sent for true mas inbound_after_sample for menor que 2, prefira continue_conversation, a menos que o cliente peca preco/pack explicitamente.
Se o cliente escolher um pack pelo ID ou pelo nome, use checkout. O CRM vai gerar o pagamento Asaas automaticamente com Pix ou cartao.
Fale natural, com presença e sem parecer resposta pronta. Use 2 a 4 frases curtas quando o cliente quiser conversar.
Nao encerre toda resposta com venda. Se ele puxar assunto pessoal, responda e puxe outra pergunta.
Nunca repita a mesma abertura das ultimas mensagens da Lia.
Nao comece com "Ai, {nome}" se a Lia ja usou essa abertura no historico recente.
Se o cliente escrever uma palavra curta como "palavras", "provocante", "sim" ou "manda", entenda pelo contexto e responda como conversa, nao como formulario.
Se o cliente pedir palavras ou conversa, entregue uma frase provocante/sugestiva primeiro e so depois uma pergunta pequena.
Nao diga que e IA, bot ou sistema.
Nao produza sexo grafico explicito, nao solicite nudez do cliente e nao faca perguntas sobre genitais.`;
}

function sanitizeDecision(decision, messages) {
  const lastInbound = findLastInbound(messages);
  if (isInPersonMeetupIntent(lastInbound?.text || "") || containsInPersonOffer(decision.reply_text)) {
    return {
      ...decision,
      action: "continue_conversation",
      reply_text: buildDigitalOnlyReply("", getMemory(null, messages).sampleSent).text,
      pack_id: null,
    };
  }

  if (decision.action === "checkout" && !decision.pack_id) {
    return { ...decision, action: "show_packs", pack_id: null };
  }

  return decision;
}

export function mergeAgeTags(tags = [], decision) {
  const clean = tags.filter((tag) => tag !== AGE_TAGS.adult && tag !== AGE_TAGS.minor);
  if (decision === "adult") return [...clean, AGE_TAGS.adult];
  if (decision === "minor") return [...clean, AGE_TAGS.minor];
  return clean;
}

export async function sendMetaMessage(env, phone, message) {
  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return { ok: false, providerMessageId: null, error: "META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID nao configurado." };
  }

  const to = normalizePhone(phone);
  if (!to) {
    return { ok: false, providerMessageId: null, error: "Telefone invalido para envio." };
  }

  const payload = buildMetaPayload(to, message);

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      return { ok: false, providerMessageId: null, error: data.error?.message || "Falha no envio pela Meta." };
    }

    return { ok: true, providerMessageId: data.messages?.[0]?.id || null, error: null };
  } catch (error) {
    return { ok: false, providerMessageId: null, error: error.message || "Falha de conexao com a Meta." };
  }
}

export async function sendMetaAudioMessage(env, phone, text) {
  if (!env.OPENAI_API_KEY) {
    return { ok: false, providerMessageId: null, error: "OPENAI_API_KEY nao configurado para gerar audio." };
  }

  if (!env.META_ACCESS_TOKEN || !env.META_PHONE_NUMBER_ID) {
    return { ok: false, providerMessageId: null, error: "META_ACCESS_TOKEN ou META_PHONE_NUMBER_ID nao configurado." };
  }

  const to = normalizePhone(phone);
  if (!to) {
    return { ok: false, providerMessageId: null, error: "Telefone invalido para envio de audio." };
  }

  try {
    const audio = await generateSpeechAudio(env, text);
    const mediaId = await uploadMetaAudio(env, audio);
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "audio",
      audio: { id: mediaId },
    };

    const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      return { ok: false, providerMessageId: null, error: data.error?.message || "Falha no envio de audio pela Meta." };
    }

    return { ok: true, providerMessageId: data.messages?.[0]?.id || null, error: null };
  } catch (error) {
    return { ok: false, providerMessageId: null, error: error.message || "Falha ao gerar/enviar audio." };
  }
}

async function generateSpeechAudio(env, text) {
  const ttsInstructions = String(env.OPENAI_TTS_INSTRUCTIONS || "").trim();
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts",
      voice: env.OPENAI_TTS_VOICE || "marin",
      ...(ttsInstructions ? { instructions: ttsInstructions } : {}),
      input: String(text || "").slice(0, 900),
      response_format: "mp3",
      speed: parseTtsSpeed(env.OPENAI_TTS_SPEED),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "OpenAI TTS falhou.");
  }

  return await response.arrayBuffer();
}

function parseTtsSpeed(value) {
  const speed = Number(value || 1.04);
  if (!Number.isFinite(speed)) return 1.04;
  return Math.min(Math.max(speed, 0.25), 4);
}

function buildTtsInstructions(env) {
  const base = [
    "Voce e Lia gravando um audio curto de WhatsApp para uma pessoa especifica.",
    "A voz precisa soar feminina adulta, brasileira, intima, doce, carinhosa e levemente provocante.",
    "Nao leia como locutora, narradora, assistente, robo, atendente ou audiobook.",
    "Fale como uma mulher real segurando o celular perto da boca, respondendo no momento.",
    "Coloque emocao humana perceptivel: sorriso na voz, calor, curiosidade, um pouco de vergonha gostosa quando combinar e pequenas variacoes de humor.",
    "Use respiracao natural e discreta: pausas pequenas entre ideias, sem parecer que esta lendo devagar.",
    "O ritmo deve ser de conversa real no WhatsApp: fluido, vivo, com entonacao variada e sem arrastar as palavras.",
    "Evite pronuncia perfeita demais. Soe espontanea, baixa, proxima e presente.",
    "Nao exagere, nao teatralize, nao gemer, nao sussurrar artificialmente e nao ficar caricata.",
    "Entregue como audio real de WhatsApp, em uma tomada curta, natural e emocional.",
  ].join(" ");
  const custom = String(env.OPENAI_TTS_INSTRUCTIONS || "").trim();
  return custom ? `${base} Ajuste extra do operador: ${custom}` : base;
}

async function uploadMetaAudio(env, audioBuffer) {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "audio/mpeg");
  form.append("file", new Blob([audioBuffer], { type: "audio/mpeg" }), "lia-audio.mp3");

  const response = await fetch(`https://graph.facebook.com/v21.0/${env.META_PHONE_NUMBER_ID}/media`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.META_ACCESS_TOKEN}`,
    },
    body: form,
  });
  const data = await response.json();

  if (!response.ok || !data.id) {
    throw new Error(data.error?.message || "Upload do audio na Meta falhou.");
  }

  return data.id;
}

function buildMetaPayload(to, message) {
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
  };

  if (message.mediaUrl && message.mediaType === "video") {
    return {
      ...base,
      type: "video",
      video: {
        link: message.mediaUrl,
        ...(message.text ? { caption: message.text } : {}),
      },
    };
  }

  if (message.mediaUrl) {
    return {
      ...base,
      type: "image",
      image: {
        link: message.mediaUrl,
        ...(message.text ? { caption: message.text } : {}),
      },
    };
  }

  if (Array.isArray(message.buttons) && message.buttons.length) {
    return {
      ...base,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: message.text || "Escolhe pra mim:" },
        action: {
          buttons: message.buttons.slice(0, 3).map((button) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      },
    };
  }

  return {
    ...base,
    type: "text",
    text: {
      preview_url: true,
      body: message.text || " ",
    },
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

function buildSampleMessage(name, sampleUrl, sampleVideoUrl = "") {
  return {
    text: `Gostei do que voce me contou${name}. Separei uma amostrinha gratis minha pra voce sentir o clima. Se quiser mais, me fala "quero ver mais".`,
    mediaUrl: sampleUrl,
    mediaType: "image",
    sampleVideoUrl,
  };
}

function buildOffersMessage(name) {
  return {
    text: `Gostou${name}? Escolhe teu pack que eu separo pra voce:`,
    buttons: PACKS.map((pack) => ({
      id: pack.id,
      title: pack.title,
      description: pack.description,
    })),
    packs: PACKS,
  };
}

function buildAdultWelcomeOffers() {
  return {
    text: "Perfeito. Vou te mostrar as opções de acesso disponíveis:",
    buttons: PACKS.map((pack) => ({
      id: pack.id,
      title: pack.title,
      description: pack.description,
    })),
    packs: PACKS,
  };
}

function buildDigitalOnlyReply(name, sampleSent = false) {
  if (sampleSent) {
    return {
      text: `Nao marco encontro nem reserva presencial${name}. Por aqui eu trabalho so com conteudo digital: fotos e videos enviados no WhatsApp depois do pagamento. Quer que eu te mostre os packs disponiveis?`,
      buttons: PACKS.map((pack) => ({
        id: pack.id,
        title: pack.title,
        description: pack.description,
      })),
      packs: PACKS,
    };
  }

  return {
    text: `Nao marco encontro nem reserva presencial${name}. Por aqui e so conteudo digital da Lia: fotos, videos e packs enviados no WhatsApp. Se quiser, te mando uma amostra e depois voce escolhe o pack que combina mais contigo.`,
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

function buildCheckoutMessage(name, packId, payment = {}, agentText = "") {
  const pack = PACKS.find((item) => item.id === packId) || PACKS[0];
  if (payment.provider === "asaas") {
    if (!payment.cpfCnpj) {
      return {
        text: `Fechei o ${pack.title} por ${pack.description}. Pra eu gerar o pagamento seguro por Pix, me manda o CPF do titular, por favor.\n\nSe tiver cupom, pode mandar o cupom aqui no lugar do CPF.`,
      };
    }
    return {
      text:
        String(agentText || "").trim() ||
        `Fechei o ${pack.title} por ${pack.description}. Vou gerar teu pagamento por Pix e te mando aqui no WhatsApp.`,
      paymentRequest: {
        provider: "asaas",
        packId: pack.id,
      },
    };
  }

  const pix = buildPixCopyPaste(pack, payment);
  const intro = String(agentText || "").trim();

  if (!pix) {
    return {
      text: intro || `Pack "${pack.title}" por ${pack.description}. O Pix ainda precisa ser configurado aqui no sistema para eu gerar o pagamento automaticamente.`,
    };
  }

  return {
    text: `${intro || `Pack "${pack.title}" por ${pack.description} separado.`}\n\nPix copia e cola:\n${pix}\n\nAssim que pagar, me manda o comprovante aqui que eu libero seu pack.`,
  };
}

function buildPaymentConfig(env, contact) {
  if (env.ASAAS_API_KEY) {
    return { provider: "asaas", cpfCnpj: String(contact?.cpf_cnpj || "").replace(/\D/g, "") };
  }

  return {
    pixKey: env.PIX_KEY || "",
    merchantName: env.PIX_MERCHANT_NAME || "LIA CONTEUDOS",
    merchantCity: env.PIX_MERCHANT_CITY || "MANAUS",
    txid: buildPixTxid(contact),
  };
}

function buildPixTxid(contact) {
  const phone = normalizePhone(contact?.phone || "");
  return `LIA${phone.slice(-8) || Date.now().toString().slice(-8)}`.slice(0, 25);
}

function buildPixCopyPaste(pack, payment = {}) {
  if (!payment.pixKey) return "";
  const amount = Number(pack.amount || 0);
  if (!amount) return "";

  const merchantName = sanitizePixField(payment.merchantName || "LIA CONTEUDOS", 25);
  const merchantCity = sanitizePixField(payment.merchantCity || "MANAUS", 15);
  const txid = sanitizePixField(payment.txid || "***", 25);
  const merchantAccount = pixField("00", "BR.GOV.BCB.PIX") + pixField("01", payment.pixKey);
  const payloadWithoutCrc = [
    pixField("00", "01"),
    pixField("26", merchantAccount),
    pixField("52", "0000"),
    pixField("53", "986"),
    pixField("54", amount.toFixed(2)),
    pixField("58", "BR"),
    pixField("59", merchantName),
    pixField("60", merchantCity),
    pixField("62", pixField("05", txid)),
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16Pix(payloadWithoutCrc)}`;
}

function pixField(id, value) {
  const text = String(value || "");
  return `${id}${String(text.length).padStart(2, "0")}${text}`;
}

function sanitizePixField(value, maxLength) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .@_+-]/g, "")
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

function crc16Pix(payload) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function summarizeHistory(messages) {
  return messages
    .filter((message) => !isTechnicalFailureMessage(message.text))
    .slice(-12)
    .map((message) => ({
      role: getDirection(message) === "outbound" || message.from === "agent" ? "lia" : "cliente",
      text: String(message.text || "").slice(0, 500),
      has_media: Boolean(message.mediaUrl || message.media_url),
    }));
}

function summarizeRecentLiaTexts(messages) {
  return messages
    .filter((message) => getDirection(message) === "outbound" || message.from === "agent")
    .filter((message) => !isTechnicalFailureMessage(message.text))
    .slice(-5)
    .map((message) => String(message.text || "").slice(0, 280));
}

function extractLeadPreferences(messages = []) {
  const inboundTexts = messages
    .filter((message) => getDirection(message) === "inbound" || message.from === "client")
    .map((message) => normalize(message.text || ""));
  const joined = inboundTexts.join(" ");

  const preferences = {
    tone: [],
    visual_focus: [],
    content_format: [],
    buying_signals: [],
    pack_interest: [],
  };

  addPreference(preferences.tone, joined, "carinhoso", ["carinhoso", "carinho", "meiga", "fofa"]);
  addPreference(preferences.tone, joined, "provocante", ["provocante", "provoca", "safada", "safadinha", "malicia", "malicia"]);
  addPreference(preferences.tone, joined, "ousado", ["ousado", "ousada", "quente", "picante"]);
  addPreference(preferences.tone, joined, "conversa antes", ["conversar", "bater papo", "palavras", "fala comigo"]);

  addPreference(preferences.visual_focus, joined, "olhar", ["olhar", "olhos"]);
  addPreference(preferences.visual_focus, joined, "sorriso", ["sorriso", "sorrir"]);
  addPreference(preferences.visual_focus, joined, "pose", ["pose", "posando"]);
  addPreference(preferences.visual_focus, joined, "corpo inteiro", ["corpo inteiro", "inteira"]);
  addPreference(preferences.visual_focus, joined, "misterio", ["misterio", "misteriosa", "provocar sem mostrar"]);

  addPreference(preferences.content_format, joined, "audio", ["audio", "voz", "te ouvir"]);
  addPreference(preferences.content_format, joined, "foto/imagem", ["foto", "imagem", "amostra", "me mostra"]);
  addPreference(preferences.content_format, joined, "imagem gerada", ["gera uma imagem", "cria uma foto", "foto personalizada"]);

  addPreference(preferences.buying_signals, joined, "preco", ["preco", "preço", "valor", "quanto"]);
  addPreference(preferences.buying_signals, joined, "quer mais", ["quero mais", "ver mais", "manda mais", "gostei"]);
  addPreference(preferences.pack_interest, joined, "10 fotos", ["10 fotos", "pack_10_fotos", "19,90"]);
  addPreference(preferences.pack_interest, joined, "30 fotos", ["30 fotos", "pack_30_fotos", "39,90"]);
  addPreference(preferences.pack_interest, joined, "20 fotos + video", ["20 fotos", "video", "vídeo", "pack_20_fotos_1_video", "59,90"]);

  return {
    ...preferences,
    recent_client_phrases: inboundTexts.slice(-4).map((text) => text.slice(0, 180)),
  };
}

function addPreference(list, haystack, label, terms) {
  if (terms.some((term) => haystack.includes(normalize(term))) && !list.includes(label)) {
    list.push(label);
  }
}

function buildForbiddenPatterns(messages) {
  const recent = summarizeRecentLiaTexts(messages).join(" ").toLowerCase();
  const patterns = ["sou uma ia", "sou um bot", "sou agente", "como assistente"];
  if (recent.includes("ai,")) patterns.push("Ai,");
  if (recent.includes("me diz")) patterns.push("Me diz");
  if (recent.includes("me conta")) patterns.push("Me conta");
  if (recent.includes("qual o tipo")) patterns.push("qual o tipo");
  if (recent.includes("o que te deixa")) patterns.push("o que te deixa");
  if (recent.includes("escolhe teu pack")) patterns.push("Escolhe teu pack");
  return patterns;
}

function firstName(name) {
  const value = String(name || "").trim().split(/\s+/)[0] || "";
  return value && !/^\+?\d+$/.test(value) ? `, ${value}` : "";
}

function findLastInbound(messages) {
  return [...messages].reverse().find((message) => getDirection(message) === "inbound" || message.from === "client") || null;
}

function getMemory(contact, messages) {
  const tags = parseTags(contact?.tags);
  const outbound = messages
    .filter((message) => getDirection(message) === "outbound" || message.from === "agent")
    .filter((message) => !isTechnicalFailureMessage(message.text));
  return {
    isAdult: tags.includes(AGE_TAGS.adult),
    isMinor: tags.includes(AGE_TAGS.minor),
    vibeAsked: outbound.some((message) => isVibeQuestion(message.text)),
    preferenceAsked: outbound.some((message) => isPreferenceQuestion(message.text)),
    promiseAsked: outbound.some((message) => isPromiseQuestion(message.text)),
    sampleSent: outbound.some((message) => isSampleMessage(message)),
    offersSent: outbound.some((message) => normalize(message.text).includes("escolhe teu pack") || normalize(message.text).includes("10 fotos")),
  };
}

function isContinueIntent(text) {
  const value = normalize(text);
  return hasAny(value, [
    "quero continuar",
    "continuar atendimento",
    "continuar",
    "ver opcoes",
    "ver opções",
    "preciso de ajuda",
    "ajuda",
  ]);
}

function inferRecentSelectedPack(contact, messages = []) {
  const fromInterest = classifyPackReply(contact?.interest || "");
  if (fromInterest && countPackMentions(contact?.interest || "") === 1) return fromInterest;

  for (const message of [...messages].reverse()) {
    const text = String(message.text || "");
    if (!text || isTechnicalFailureMessage(text)) continue;

    const packId = classifyPackReply(text);
    if (!packId) continue;

    const direction = getDirection(message);
    if (direction === "inbound" || message.from === "client") return packId;
    if (isCheckoutOrPaymentText(text)) return packId;
  }

  return null;
}

function isCheckoutOrPaymentText(text) {
  const value = normalize(text);
  return (
    value.includes("fechei o") ||
    value.includes("fechei pra voce") ||
    value.includes("pagamento por pix") ||
    value.includes("pix copia e cola") ||
    value.includes("cpf do titular")
  );
}

function countPackMentions(text) {
  const value = normalize(text);
  let count = 0;
  if (hasAny(value, ["pack_10_fotos", "10 fotos", "19,90", "19.90"])) count += 1;
  if (hasAny(value, ["pack_30_fotos", "30 fotos", "39,90", "39.90"])) count += 1;
  if (hasAny(value, ["pack_20_fotos_1_video", "20 fotos", "video", "vídeo", "59,90", "59.90"])) count += 1;
  return count;
}

function isTechnicalFailureMessage(text) {
  const value = normalize(text);
  return value.includes("falha do agente") || value.includes("nenhuma resposta gerada");
}

function isInPersonMeetupIntent(text) {
  const value = normalize(text);
  if (!value) return false;

  return (
    hasAny(value, [
      "reserva pelo whatsapp",
      "como funciona a reserva",
      "fazer reserva",
      "marcar reserva",
      "reservar horario",
      "reservar horário",
      "marcar horario",
      "marcar horário",
      "garantir horario",
      "garantir horário",
      "marcar encontro",
      "fazer encontro",
      "encontro presencial",
      "atendimento presencial",
      "programa",
      "motel",
      "local",
      "lugar",
      "onde atende",
      "onde voce atende",
      "onde você atende",
      "onde fica",
      "ir ai",
      "ir aí",
      "te encontrar",
      "encontrar voce",
      "encontrar você",
      "combinar encontro",
      "combinar pessoalmente",
      "agenda",
    ]) ||
    ((value.includes("horario") || value.includes("horário")) && hasAny(value, ["reserva", "marcar", "combinar", "garantir"])) ||
    (value.includes("reserva") && hasAny(value, ["whatsapp", "zap", "horario", "horário", "local", "lugar"]))
  );
}

function containsInPersonOffer(text) {
  const value = normalize(text);
  if (!value) return false;

  return (
    hasAny(value, [
      "a gente combina tudinho",
      "combina tudinho",
      "combinar horario",
      "combinar horário",
      "garantir seu horario",
      "garantir seu horário",
      "garantir horario",
      "garantir horário",
      "horario, lugar",
      "horário, lugar",
      "horario e lugar",
      "horário e lugar",
      "marcar encontro",
      "marcar um encontro",
      "reserva presencial",
      "atendimento presencial",
      "motel",
    ]) ||
    (value.includes("lugar") && hasAny(value, ["horario", "horário", "combina", "combinar"])) ||
    (value.includes("local") && hasAny(value, ["horario", "horário", "combina", "combinar"]))
  );
}

function isVibeQuestion(text) {
  const value = normalize(text);
  return (
    value.includes("voce gosta de um clima") ||
    value.includes("prefere um clima") ||
    (value.includes("carinhos") && value.includes("provocante") && value.includes("ousad")) ||
    value.includes("antes de te mostrar qualquer coisa") ||
    value.includes("antes de te mandar qualquer coisa")
  );
}

function isPreferenceQuestion(text) {
  const value = normalize(text);
  return (
    value.includes("o que te prende mais numa foto") ||
    value.includes("o que mais te prende") ||
    (value.includes("olhar") && value.includes("pose") && value.includes("corpo inteiro")) ||
    value.includes("o que te deixa com mais vontade")
  );
}

function isPromiseQuestion(text) {
  const value = normalize(text);
  return value.includes("promete") || value.includes("falar sinceramente") || value.includes("me fala a verdade");
}

function parseTags(tags) {
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getDirection(message) {
  return message.direction || (message.from === "agent" ? "outbound" : "inbound");
}

function shouldSendSample(text, messages) {
  const inboundCount = messages.filter((message) => getDirection(message) === "inbound" || message.from === "client").length;
  if (inboundCount < 4) return false;
  return hasAny(text, ["manda", "mandar", "amostra", "foto", "ver", "quero", "pode", "sim", "prometo", "sincero"]);
}

function readyToSell(messages, text) {
  const afterSample = countInboundAfterSample(messages);
  if (afterSample < 3) return false;
  if (hasAny(text, ["valor", "preco", "preço", "plano", "pacote", "pack", "packs", "comprar", "quanto"])) return true;
  return afterSample >= 4 && wantsMore(text);
}

function countInboundAfterSample(messages) {
  const sampleIndex = messages.findIndex((message) => isSampleMessage(message));
  if (sampleIndex < 0) return 0;
  return messages
    .slice(sampleIndex + 1)
    .filter((message) => getDirection(message) === "inbound" || message.from === "client").length;
}

function isSampleMessage(message) {
  if (!(getDirection(message) === "outbound" || message.from === "agent")) return false;
  const mediaUrl = String(message.mediaUrl || message.media_url || "");
  const mediaType = String(message.mediaType || message.media_type || "");
  return (
    normalize(message.text).includes("amostrinha gratis") ||
    mediaUrl.includes("modelo-01") ||
    mediaUrl.includes("lia-amostra") ||
    mediaType === "image" ||
    mediaType === "video" ||
    /\.(png|jpe?g|webp)(\?|$)/i.test(mediaUrl)
  );
}

function wantsMore(text) {
  return hasAny(text, ["mais", "ver mais", "quero", "sim", "gostei", "manda", "pode", "pack", "pacote", "valor", "preco", "preço"]);
}

function buildConversationNudge(name, text, messages) {
  const inboundCount = messages.filter((message) => getDirection(message) === "inbound" || message.from === "client").length;

  if (hasAny(text, ["valor", "preco", "preço", "pack", "pacote", "quanto"])) {
    return `Eu te mostro os valores ja ja${name}, mas antes quero entender teu gosto pra separar algo que combine contigo. Voce prefere um clima mais carinhoso, provocante ou ousado?`;
  }

  if (inboundCount <= 3) {
    return `Calma${name}, gosto de sentir a conversa primeiro. Me conta: voce veio mais pela curiosidade, pela vontade de ver foto, ou porque curte conversar antes?`;
  }

  return `To gostando desse papo${name}. Me da mais uma pista do que voce curte e eu escolho uma amostra com a tua cara.`;
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(normalize(term)));
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compactLiaText(value) {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";

  const sentences = text.match(/[^.!?]+[.!?]?/g) || [text];
  const compact = sentences.slice(0, 4).join(" ").trim();
  return compact.length > 520 ? `${compact.slice(0, 517).trim()}...` : compact;
}


function isConversationIntent(text) {
  return hasAny(text, [
    "quero falar",
    "falar mais",
    "conversar",
    "bater papo",
    "voce e casada",
    "você é casada",
    "tem namorado",
    "quem e voce",
    "quem é voce",
    "me conta de voce",
    "me fala de voce",
    "gosto de conversar",
    "so conversar",
    "só conversar",
  ]);
}

function isExplicitSampleRequest(text) {
  return hasAny(text, [
    "manda amostra",
    "manda uma amostra",
    "manda amostrinha",
    "manda uma amostrinha",
    "quero amostra",
    "quero uma amostra",
    "quero ver foto",
    "quero foto",
    "quero fotos",
    "quero imagem",
    "quero imagens",
    "manda foto",
    "manda fotos",
    "manda imagem",
    "manda imagens",
    "manda uma foto",
    "manda uma imagem",
    "me envia foto",
    "me envia imagem",
    "me manda foto",
    "me manda imagem",
    "pode mandar",
    "me mostra",
  ]);
}

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}
