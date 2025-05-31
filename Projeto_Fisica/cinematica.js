/*!
 * \file cinematica.js
 * \brief Script principal para o simulador de cinemática MRUV.
 * Este arquivo contém a lógica para a simulação, manipulação do DOM,
 * desenho da animação e dos gráficos de posição e velocidade.
 */

/*! \var s0
    \brief Posição inicial da partícula (m), lida do input. */
let s0;
/*! \var v0
    \brief Velocidade inicial da partícula (m/s), lida do input. */
let v0;
/*! \var a
    \brief Array contendo as acelerações para cada um dos três intervalos (m/s²). a[0] para o intervalo 1, etc. */
let a = [], /*! \var dt
    \brief Array contendo as durações para cada um dos três intervalos (s). dt[0] para o intervalo 1, etc. */
dt = []; // a[0] = a1, dt[0] = dt1, etc.

/*! \var particula
    \brief Objeto representando o estado atual da partícula (posição 's', velocidade 'v', posição anterior 's_anterior'). */
let particula;
/*! \var tempoAnimacao
    \brief Tempo decorrido na animação da simulação (s), atualizado a cada frame. */
let tempoAnimacao;
/*! \var rodandoSimulacao
    \brief Flag booleana que indica se a simulação está em execução (true) ou não/terminada (false). */
let rodandoSimulacao = false;
/*! \var dadosGraficoPos
    \brief Array de objetos {x, y} para os pontos do gráfico de Posição (y) vs. Tempo (x). */
let dadosGraficoPos = [];
/*! \var dadosGraficoVel
    \brief Array de objetos {x, y} para os pontos do gráfico de Velocidade (y) vs. Tempo (x). */
let dadosGraficoVel = [];

// Elementos DOM para output
/*! \var elEqVel
    \brief Elemento DOM (div) para exibir as equações de velocidade formatadas. */
let elEqVel, /*! \var elEqPos
    \brief Elemento DOM (div) para exibir as equações de posição formatadas. */
elEqPos, /*! \var elDeslocamento
    \brief Elemento DOM (p) para exibir o deslocamento total calculado. */
elDeslocamento, /*! \var elEspaco
    \brief Elemento DOM (p) para exibir o espaço percorrido total calculado. */
elEspaco, /*! \var elInversao
    \brief Elemento DOM (p) para exibir os instantes de inversão de sentido. */
elInversao, /*! \var elTempoTotal
    \brief Elemento DOM (p) para exibir o tempo total da simulação. */
elTempoTotal;

// Canvas e gráficos
/*! \var animCanvas
    \brief Canvas principal p5.js para a animação da partícula. */
let animCanvas, /*! \var posGraphCanvas
    \brief Objeto p5.Graphics para o gráfico de Posição vs. Tempo. */
posGraphCanvas, /*! \var velGraphCanvas
    \brief Objeto p5.Graphics para o gráfico de Velocidade vs. Tempo. */
velGraphCanvas;
/*! \var MARGEM_GRAFICO
    \brief Constante definindo a margem interna dos gráficos em pixels, usada para eixos e rótulos. */
const MARGEM_GRAFICO = 40;
/*! \var maxPos
    \brief Valor máximo da posição atingido durante a simulação, usado para escala do gráfico de posição. */
let maxPos, /*! \var minPos
    \brief Valor mínimo da posição atingido durante a simulação, usado para escala do gráfico de posição. */
minPos, /*! \var maxVel
    \brief Valor máximo da velocidade atingido durante a simulação, usado para escala do gráfico de velocidade. */
maxVel, /*! \var minVel
    \brief Valor mínimo da velocidade atingido durante a simulação, usado para escala do gráfico de velocidade. */
minVel, /*! \var tempoTotalSimulacao
    \brief Tempo total de duração da simulação (s), soma de dt[0], dt[1] e dt[2]. */
tempoTotalSimulacao;

// NOVAS VARIÁVEIS GLOBAIS PARA OS BOTÕES E ESTADO DE PAUSA
/*! \var pauseButton
    \brief Elemento DOM para o botão de pausar a simulação. */
let pauseButton, /*! \var resumeButton
    \brief Elemento DOM para o botão de continuar (resume) a simulação. */
resumeButton;
/*! \var simulacaoPausada
    \brief Flag booleana que indica se a simulação está atualmente pausada (true) ou não (false). */
let simulacaoPausada = false;

// Cores
/*! \var COR_PARTICULA
    \brief Array RGB para a cor da partícula na animação. */
const COR_PARTICULA = [255, 0, 0];
/*! \var COR_INVERSAO
    \brief Array RGB para a cor dos marcadores de inversão de sentido na animação e gráficos. */
const COR_INVERSAO = [0, 0, 255];
/*! \var COR_EIXO
    \brief Array RGB para a cor dos eixos e rótulos nos gráficos. */
const COR_EIXO = [0, 0, 0];
/*! \var COR_GRAF_POS
    \brief Array RGB para a cor da linha no gráfico de posição. */
const COR_GRAF_POS = [0, 150, 0];
/*! \var COR_GRAF_VEL
    \brief Array RGB para a cor da linha no gráfico de velocidade. */
const COR_GRAF_VEL = [0, 0, 150];

/*!
 * \brief Função de configuração inicial do p5.js, executada uma vez no início.
 *
 * Inicializa os canvases para animação e gráficos, vinculando-os aos seus respectivos
 * contêineres HTML. Seleciona e configura os botões de controle (Iniciar, Pausar, Continuar)
 * e os elementos DOM para exibição dos resultados. Interrompe o loop de desenho inicialmente.
 */
function setup() {
    console.log("Iniciando setup...");
    // Configurar canvas de animação
    let canvasContainer = select('#canvasContainer');
    if (canvasContainer) {
        console.log("SETUP: canvasContainer.width:", canvasContainer.width); // LOG ADICIONADO
        animCanvas = createCanvas(max(1, canvasContainer.width), 200);
        animCanvas.parent(canvasContainer);
        console.log("animCanvas criado.");
    } else {
        console.error("#canvasContainer NÃO encontrado! Verifique o ID no HTML.");
        animCanvas = createCanvas(400, 200); 
        animCanvas.background(100); 
        console.warn("animCanvas criado com tamanho padrão de fallback porque #canvasContainer não foi encontrado.");
    }

    // Configurar canvas de gráficos
    let posGraphContainer = select('#posGraphContainer');
    if (posGraphContainer) {
        console.log("SETUP: posGraphContainer.width:", posGraphContainer.width, "posGraphContainer.height:", posGraphContainer.height); // LOG ADICIONADO
        let graphWidth = max(1, posGraphContainer.width);
        posGraphCanvas = createGraphics(graphWidth, 150); 
        posGraphCanvas.parent(posGraphContainer);
        console.log("posGraphCanvas criado com largura:", graphWidth, "altura:", 150);
    } else {
        console.error("#posGraphContainer NÃO encontrado!");
        posGraphCanvas = createGraphics(200, 150); // Altura corrigida para fallback também
        console.warn("posGraphCanvas criado com tamanho padrão de fallback.");
    }
    
    let velGraphContainer = select('#velGraphContainer');
    if (velGraphContainer) {
        console.log("SETUP: velGraphContainer.width:", velGraphContainer.width, "velGraphContainer.height:", velGraphContainer.height); // LOG ADICIONADO
        let graphWidth = max(1, velGraphContainer.width);
        velGraphCanvas = createGraphics(graphWidth, 150); 
        velGraphCanvas.parent(velGraphContainer);
        console.log("velGraphCanvas criado com largura:", graphWidth, "altura:", 150);
    } else {
        console.error("#velGraphContainer NÃO encontrado!");
        velGraphCanvas = createGraphics(200, 150); // Altura corrigida para fallback também
        console.warn("velGraphCanvas criado com tamanho padrão de fallback.");
    }


    // Inputs
    let startButton = select('#startButton');
    if (startButton) {
        console.log("#startButton ENCONTRADO. Anexando mousePressed.");
        startButton.mousePressed(iniciarSimulacao);
    } else {
        console.error("#startButton NÃO encontrado!");
    }

    // NOVOS BOTÕES DE PAUSA/CONTINUAR
    pauseButton = select('#pauseButton');
    if (pauseButton) {
        pauseButton.mousePressed(pausarSimulacao);
        pauseButton.attribute('disabled', ''); // Começa desabilitado
    } else {
        console.error("#pauseButton NÃO encontrado!");
    }

    resumeButton = select('#resumeButton');
    if (resumeButton) {
        resumeButton.mousePressed(continuarSimulacao);
        resumeButton.attribute('disabled', ''); // Começa desabilitado
    } else {
        console.error("#resumeButton NÃO encontrado!");
    }

    // Outputs
    // É importante que esses elementos existam no HTML
    elEqVel = select('#eqVelocidades');
    elEqPos = select('#eqPosicoes');
    elDeslocamento = select('#deslocamentoTotal');
    elEspaco = select('#espacoPercorrido');
    elInversao = select('#instantesInversao');
    elTempoTotal = select('#tempoTotal');

    // Verificar se os elementos de output foram encontrados
    if (!elEqVel) console.error("#eqVelocidades não encontrado!");
    if (!elEqPos) console.error("#eqPosicoes não encontrado!");
    // ... adicione verificações para os outros elementos de output se necessário

    noLoop(); 
    console.log("Setup completo.");
}

/*!
 * \brief Inicia ou reinicia a simulação com base nos parâmetros fornecidos pelo usuário.
 *
 * Esta função é chamada quando o botão "Iniciar" é pressionado.
 * Ela lê os valores dos campos de input (s₀, v₀, a₁, Δt₁, a₂, Δt₂, a₃, Δt₃),
 * valida esses valores (verifica se são números e se as durações são positivas).
 * Inicializa/reinicializa o estado da partícula, o tempo da animação, os dados dos gráficos,
 * e o tempo total da simulação. Calcula os resultados completos (equações, deslocamento, etc.)
 * e os exibe. Habilita o botão de pausa, desabilita o de continuar e inicia o loop de desenho do p5.js.
 */
function iniciarSimulacao() {
    console.log("--- iniciarSimulacao() CHAMADA ---");

    // Selecionar elementos de input DENTRO da função para garantir que existem
    let s0_input = select('#s0');
    let v0_input = select('#v0');
    let a1_input = select('#a1');
    let dt1_input = select('#dt1');
    let a2_input = select('#a2');
    let dt2_input = select('#dt2');
    let a3_input = select('#a3');
    let dt3_input = select('#dt3');

    if (!s0_input || !v0_input || !a1_input || !dt1_input || !a2_input || !dt2_input || !a3_input || !dt3_input) {
        alert("Erro: Um ou mais campos de input não foram encontrados no HTML. Verifique os IDs.");
        console.error("Erro fatal: Campos de input não encontrados.");
        return;
    }

    s0 = float(select('#s0').value());
    v0 = float(select('#v0').value());
    a[0] = float(select('#a1').value());
    dt[0] = float(select('#dt1').value());
    a[1] = float(select('#a2').value());
    dt[1] = float(select('#dt2').value());
    a[2] = float(select('#a3').value());
    dt[2] = float(select('#dt3').value());

    if (isNaN(s0) || isNaN(v0) || isNaN(a[0]) || isNaN(dt[0]) || isNaN(a[1]) || isNaN(dt[1]) || isNaN(a[2]) || isNaN(dt[2])) {
        alert("Erro: Um ou mais valores de entrada não são números válidos. Verifique os campos.");
        return; 
    }
    if (dt[0] <= 0 || dt[1] <= 0 || dt[2] <= 0) {
        alert("As durações dos intervalos (Δt) devem ser positivas e maiores que zero.");
        return;
    }

    particula = { s: s0, v: v0, s_anterior: s0 };
    tempoAnimacao = 0;
    dadosGraficoPos = [];
    dadosGraficoVel = [];
    tempoTotalSimulacao = dt[0] + dt[1] + dt[2];
    maxPos = s0; minPos = s0;
    maxVel = v0; minVel = v0;

    rodandoSimulacao = true;
    simulacaoPausada = false; // Reseta o estado de pausa
    
    calcularResultadosCompletos(); 
    
    // Atualiza estado dos botões de pausa/continuar
    if (pauseButton) pauseButton.removeAttribute('disabled');
    if (resumeButton) resumeButton.attribute('disabled', '');

    loop(); 
    console.log("--- fim de iniciarSimulacao() ---");
}

/*!
 * \brief Pausa a simulação em andamento.
 *
 * Chamada quando o botão "Pausar" é pressionado. Se a simulação estiver
 * rodando e não estiver já pausada, esta função interrompe o loop de desenho
 * do p5.js (`noLoop()`) e atualiza o estado da flag `simulacaoPausada`.
 * Também ajusta o estado de habilitação dos botões "Pausar" e "Continuar".
 */
function pausarSimulacao() {
    if (rodandoSimulacao && !simulacaoPausada) {
        noLoop();
        simulacaoPausada = true;
        if (pauseButton) pauseButton.attribute('disabled', '');
        if (resumeButton) resumeButton.removeAttribute('disabled');
        console.log("Simulação PAUSADA.");
    }
}

/*!
 * \brief Continua uma simulação previamente pausada.
 *
 * Chamada quando o botão "Continuar" é pressionado. Se a simulação estiver
 * rodando e estiver pausada, esta função retoma o loop de desenho do p5.js (`loop()`)
 * e atualiza o estado da flag `simulacaoPausada`.
 * Também ajusta o estado de habilitação dos botões "Pausar" e "Continuar".
 */
function continuarSimulacao() {
    if (rodandoSimulacao && simulacaoPausada) {
        loop();
        simulacaoPausada = false;
        if (pauseButton) pauseButton.removeAttribute('disabled');
        if (resumeButton) resumeButton.attribute('disabled', '');
        console.log("Simulação CONTINUADA.");
    }
}

/*!
 * \brief Calcula e exibe os resultados completos da simulação com base nos parâmetros atuais.
 *
 * Esta função é chamada no início da simulação. Ela itera sobre os três intervalos de movimento
 * para calcular:
 * - As equações de velocidade e posição para cada intervalo.
 * - O deslocamento total da partícula.
 * - O espaço total percorrido pela partícula, considerando possíveis inversões de sentido.
 * - Os instantes exatos em que ocorrem inversões de sentido.
 * - Os valores mínimos e máximos de posição e velocidade atingidos durante toda a simulação,
 *   para escalar adequadamente os eixos dos gráficos.
 * Os resultados calculados são então formatados e exibidos nos elementos DOM correspondentes.
 */
function calcularResultadosCompletos() {
    console.log("--- calcularResultadosCompletos() INICIADA ---");
    let s_atual_calc = s0; 
    let v_atual_calc = v0; 
    let t_acumulado_calc = 0; 
    let deslocamentoTotalCalc = 0;
    let espacoPercorridoTotal = 0;
    let instantesInversaoCalc = []; 
    let equacoesV_html = "<p><strong>Eq. Velocidades:</strong></p><pre>";
    let equacoesS_html = "<p><strong>Eq. Posições:</strong></p><pre>";

    maxPos = s0; 
    minPos = s0;
    maxVel = v0; 
    minVel = v0;
    
    for (let i = 0; i < 3; i++) {
        let v_inicio_intervalo_calc = v_atual_calc;
        let s_inicio_intervalo_calc = s_atual_calc;
        
        // Modificação para equações de velocidade
        equacoesV_html += `Intervalo ${i+1} (t' de 0 a ${dt[i]}s, t_global de ${t_acumulado_calc.toFixed(2)}s a ${(t_acumulado_calc + dt[i]).toFixed(2)}s):    `; // Removido \n, adicionado espaço
        equacoesV_html += `v${i+1}(t') = ${v_inicio_intervalo_calc.toFixed(2)} + (${a[i].toFixed(2)}) * t'\n\n`; // Removidos espaços iniciais

        // Modificação para equações de posição
        equacoesS_html += `Intervalo ${i+1} (t' de 0 a ${dt[i]}s, t_global de ${t_acumulado_calc.toFixed(2)}s a ${(t_acumulado_calc + dt[i]).toFixed(2)}s):    `; // Removido \n, adicionado espaço
        equacoesS_html += `s${i+1}(t') = ${s_inicio_intervalo_calc.toFixed(2)} + (${v_inicio_intervalo_calc.toFixed(2)}) * t' + 0.5 * (${a[i].toFixed(2)}) * t'^2\n\n`; // Removidos espaços iniciais

        // Cálculo do espaço percorrido e instantes de inversão
        if (a[i] !== 0) {
            let t_inv_local = -v_inicio_intervalo_calc / a[i];
            if (t_inv_local > 1e-6 && t_inv_local < dt[i]) { // Inversão ocorre DENTRO do intervalo
                instantesInversaoCalc.push(t_acumulado_calc + t_inv_local);
                console.log(`  Inversão detectada no intervalo ${i+1} em t' = ${(t_inv_local).toFixed(2)}s (t_global = ${(t_acumulado_calc + t_inv_local).toFixed(2)}s)`);
                // Espaço até a inversão
                let s_na_inversao = s_inicio_intervalo_calc + v_inicio_intervalo_calc * t_inv_local + 0.5 * a[i] * t_inv_local * t_inv_local;
                espacoPercorridoTotal += abs(s_na_inversao - s_inicio_intervalo_calc);
                // Espaço da inversão até o fim do intervalo
                let s_fim_intervalo_calc_temp = s_inicio_intervalo_calc + v_inicio_intervalo_calc * dt[i] + 0.5 * a[i] * dt[i] * dt[i];
                espacoPercorridoTotal += abs(s_fim_intervalo_calc_temp - s_na_inversao);
            } else { // Sem inversão DENTRO do intervalo, ou inversão nas bordas (não conta como inversão "no meio")
                let s_fim_intervalo_calc_temp = s_inicio_intervalo_calc + v_inicio_intervalo_calc * dt[i] + 0.5 * a[i] * dt[i] * dt[i];
                espacoPercorridoTotal += abs(s_fim_intervalo_calc_temp - s_inicio_intervalo_calc);
            }
        } else { // Movimento uniforme (a[i] == 0)
            let s_fim_intervalo_calc_temp = s_inicio_intervalo_calc + v_inicio_intervalo_calc * dt[i];
            espacoPercorridoTotal += abs(s_fim_intervalo_calc_temp - s_inicio_intervalo_calc);
        }
        
        s_atual_calc = s_inicio_intervalo_calc + v_inicio_intervalo_calc * dt[i] + 0.5 * a[i] * dt[i] * dt[i];
        v_atual_calc = v_inicio_intervalo_calc + a[i] * dt[i];
        t_acumulado_calc += dt[i];
    }
    equacoesV_html += "</pre>";
    equacoesS_html += "</pre>";

    deslocamentoTotalCalc = s_atual_calc - s0;

    if(elEqVel) elEqVel.html(equacoesV_html);
    if(elEqPos) elEqPos.html(equacoesS_html);
    if(elDeslocamento) elDeslocamento.html(`<strong>Deslocamento Total:</strong> ${deslocamentoTotalCalc.toFixed(2)} m`);
    if(elEspaco) elEspaco.html(`<strong>Espaço Percorrido Total:</strong> ${espacoPercorridoTotal.toFixed(2)} m`);
    if(elInversao) {
        if (instantesInversaoCalc.length > 0) {
            elInversao.html(`<strong>Instante(s) de Inversão de Sentido:</strong> ${instantesInversaoCalc.map(t => t.toFixed(2)).join(', ')} s`);
        } else {
            elInversao.html("<strong>Instante(s) de Inversão de Sentido:</strong> Nenhum detectado nos intervalos.");
        }
    }
    if(elTempoTotal) elTempoTotal.html(`<strong>Tempo Total de Simulação:</strong> ${tempoTotalSimulacao.toFixed(2)} s`);

    // Pré-calcular todos os pontos para os gráficos para determinar escalas min/max
    // Estes dados não são os mesmos que 'dadosGraficoPos' e 'dadosGraficoVel' usados para desenhar,
    // mas são usados para encontrar os limites dos eixos.
    let t_graf_iter = 0;
    let s_graf_iter = s0;
    let v_graf_iter = v0;
    
    // Adiciona o ponto inicial para cálculo de escala
    if (s0 > maxPos) maxPos = s0;
    if (s0 < minPos) minPos = s0;
    if (v0 > maxVel) maxVel = v0;
    if (v0 < minVel) minVel = v0;

    console.log(`  Iniciando loop de cálculo de escalas. Tempo total: ${tempoTotalSimulacao}`);
    let passoTempoEscala = 0.05; // Define um passo pequeno para verificar pontos intermediários

    for (let i = 0; i < 3; i++) { // Itera sobre os 3 intervalos de aceleração
        let v_inicio_int_escala = v_graf_iter;
        let s_inicio_int_escala = s_graf_iter;
        // Itera dentro de cada intervalo de aceleração
        for (let ti_local = 0; ti_local <= dt[i]; ti_local += passoTempoEscala) { 
            if (ti_local === 0 && i > 0) continue; // Evita recalcular o ponto de junção, exceto o primeiro ponto do primeiro intervalo
            
            let t_global_ponto_escala;
            if (i === 0) {
                t_global_ponto_escala = ti_local;
            } else {
                // Soma as durações dos intervalos anteriores
                t_global_ponto_escala = (dt.slice(0,i).reduce((acc,val)=> acc+val,0)) + ti_local;
            }
            // Garante que não ultrapasse o tempo total da simulação
            t_global_ponto_escala = min(t_global_ponto_escala, tempoTotalSimulacao);

            let s_ponto_escala = s_inicio_int_escala + v_inicio_int_escala * ti_local + 0.5 * a[i] * ti_local * ti_local;
            let v_ponto_escala = v_inicio_int_escala + a[i] * ti_local;
            
            // Atualiza min/max para posição e velocidade
            if (s_ponto_escala > maxPos) maxPos = s_ponto_escala;
            if (s_ponto_escala < minPos) minPos = s_ponto_escala;
            if (v_ponto_escala > maxVel) maxVel = v_ponto_escala;
            if (v_ponto_escala < minVel) minVel = v_ponto_escala;

            // Se o passo de tempo local for o último do intervalo, ou se o tempo global atingiu o total
            if (abs(ti_local - dt[i]) < passoTempoEscala/2 || abs(t_global_ponto_escala - tempoTotalSimulacao) < 1e-9 ) {
                 if (abs(ti_local - dt[i]) > passoTempoEscala/2 && ti_local < dt[i]) { // Se não for o último ponto exato do intervalo, calcula o último ponto
                    let s_final_int_escala = s_inicio_int_escala + v_inicio_int_escala * dt[i] + 0.5 * a[i] * dt[i] * dt[i];
                    let v_final_int_escala = v_inicio_int_escala + a[i] * dt[i];
                    if (s_final_int_escala > maxPos) maxPos = s_final_int_escala;
                    if (s_final_int_escala < minPos) minPos = s_final_int_escala;
                    if (v_final_int_escala > maxVel) maxVel = v_final_int_escala;
                    if (v_final_int_escala < minVel) minVel = v_final_int_escala;
                 }
                 break; // Sai do loop interno de ti_local, pois já processamos até dt[i] ou o fim da simulação
            }
        }
        // Atualiza s_graf_iter e v_graf_iter para o início do próximo intervalo
        s_graf_iter = s_inicio_int_escala + v_inicio_int_escala * dt[i] + 0.5 * a[i] * dt[i] * dt[i];
        v_graf_iter = v_inicio_int_escala + a[i] * dt[i];
    }
    
    // Adiciona uma margem às escalas para que os gráficos não fiquem colados nas bordas
    if (abs(maxPos - minPos) < 1e-6) { maxPos +=1; minPos -=1;} 
    if (abs(maxVel - minVel) < 1e-6) { maxVel +=1; minVel -=1;}
    let rangePos = maxPos - minPos;
    maxPos += rangePos * 0.1 || 1; // Adiciona 10% de margem ou 1 se o range for 0
    minPos -= rangePos * 0.1 || 1;
    let rangeVel = maxVel - minVel;
    maxVel += rangeVel * 0.1 || 1;
    minVel -= rangeVel * 0.1 || 1;

    console.log(`  Escalas finais após cálculo: minPos=${minPos.toFixed(2)}, maxPos=${maxPos.toFixed(2)}, minVel=${minVel.toFixed(2)}, maxVel=${maxVel.toFixed(2)}`);
    console.log("--- calcularResultadosCompletos() FINALIZADA ---");
}

/*!
 * \brief Função de desenho principal do p5.js, chamada repetidamente a cada frame.
 *
 * Se a simulação não estiver rodando (ou seja, `rodandoSimulacao` é `false`), a função retorna
 * e desabilita os botões de pausa/continuar.
 * Caso contrário, calcula o incremento de tempo (`deltaTAnim`) desde o último frame.
 * Verifica se o tempo da animação (`tempoAnimacao`) atingiu o tempo total da simulação.
 * Se sim, marca a simulação como não rodando, para o loop de desenho, ajusta `tempoAnimacao`
 * para o valor exato de `tempoTotalSimulacao`, desabilita os botões de pausa/continuar,
 * e redesenha a animação e os gráficos uma última vez para mostrar o estado final.
 * Se a simulação ainda não terminou, determina a aceleração atual, o tempo relativo
 * dentro do intervalo atual, e as condições iniciais (posição e velocidade) desse intervalo.
 * Atualiza a posição (`particula.s`) e velocidade (`particula.v`) da partícula.
 * Adiciona os novos pontos de posição e velocidade aos arrays `dadosGraficoPos` e `dadosGraficoVel`.
 * Chama `desenharAnimacao()` e `desenharGrafico()` para atualizar as visualizações.
 * Incrementa `tempoAnimacao`, garantindo que não ultrapasse `tempoTotalSimulacao`.
 */
function draw() {
    if (!rodandoSimulacao) { // Se a simulação não deve rodar (ex: terminou), não faz nada.
        // Garante que os botões de pausa/continuar estejam desabilitados se a simulação não estiver rodando
        if (pauseButton) pauseButton.attribute('disabled', '');
        if (resumeButton) resumeButton.attribute('disabled', '');
        return;
    }

    // Se a simulação estiver pausada, não atualiza a lógica, mas draw() continua sendo chamado por loop()
    // A pausa real é feita por noLoop() e retomada por loop() nas funções pausar/continuar.
    // A lógica de atualização da animação só ocorre se não estiver pausada.
    // No entanto, a função draw() em si só é chamada se loop() estiver ativo.
    // A variável simulacaoPausada é mais para gerenciar o estado dos botões e a lógica de noLoop()/loop().

    let deltaTAnim = min(1/frameRate(), 0.05); 
    if (tempoAnimacao >= tempoTotalSimulacao) { // Condição de término da simulação
        console.log(`Fim da simulação detectado em draw(). TempoAnim: ${tempoAnimacao.toFixed(2)}, TempoTotal: ${tempoTotalSimulacao.toFixed(2)}`);
        rodandoSimulacao = false; // Marca que a simulação terminou
        simulacaoPausada = false; // Não está mais pausada, está terminada
        noLoop(); // Para o loop de desenho
        tempoAnimacao = tempoTotalSimulacao; 
        
        // Desabilita botões de pausa/continuar ao final
        if (pauseButton) pauseButton.attribute('disabled', '');
        if (resumeButton) resumeButton.attribute('disabled', '');
        
        // Redesenhar uma última vez para garantir que os gráficos mostrem o ponto final
        if (animCanvas) desenharAnimacao();
        if (posGraphCanvas) desenharGrafico(posGraphCanvas, dadosGraficoPos, minPos, maxPos, "Posição (m)", COR_GRAF_POS, tempoTotalSimulacao);
        if (velGraphCanvas) desenharGrafico(velGraphCanvas, dadosGraficoVel, minVel, maxVel, "Velocidade (m/s)", COR_GRAF_VEL, tempoTotalSimulacao);
        return; 
    }
    
    let acelAtual;
    let t_relativo_intervalo;
    let v_inicio_intervalo_anim;
    let s_inicio_intervalo_anim;
    let t_acumulado_anterior = 0;

    if (tempoAnimacao < dt[0]) {
        acelAtual = a[0];
        t_relativo_intervalo = tempoAnimacao;
        v_inicio_intervalo_anim = v0;
        s_inicio_intervalo_anim = s0;
    } else if (tempoAnimacao < dt[0] + dt[1]) {
        acelAtual = a[1];
        t_acumulado_anterior = dt[0];
        v_inicio_intervalo_anim = v0 + a[0] * dt[0];
        s_inicio_intervalo_anim = s0 + v0 * dt[0] + 0.5 * a[0] * dt[0] * dt[0];
        t_relativo_intervalo = tempoAnimacao - t_acumulado_anterior;
    } else { 
        acelAtual = a[2];
        t_acumulado_anterior = dt[0] + dt[1];
        let v_fim_int1 = v0 + a[0] * dt[0];
        v_inicio_intervalo_anim = v_fim_int1 + a[1] * dt[1];
        s_inicio_intervalo_anim = (s0 + v0 * dt[0] + 0.5 * a[0] * dt[0] * dt[0]) + 
                                  v_fim_int1 * dt[1] + 0.5 * a[1] * dt[1] * dt[1];
        t_relativo_intervalo = tempoAnimacao - t_acumulado_anterior;
    }
    
    if (particula) {
        particula.s = s_inicio_intervalo_anim + v_inicio_intervalo_anim * t_relativo_intervalo + 0.5 * acelAtual * t_relativo_intervalo * t_relativo_intervalo;
        particula.v = v_inicio_intervalo_anim + acelAtual * t_relativo_intervalo;
    }

    if (tempoAnimacao === 0 && dadosGraficoPos.length === 0) {
        dadosGraficoPos.push({ x: 0, y: s0 });
        dadosGraficoVel.push({ x: 0, y: v0 });
    }

    if (particula && tempoAnimacao <= tempoTotalSimulacao) {
        let ultimoTempoPos = dadosGraficoPos.length > 0 ? dadosGraficoPos[dadosGraficoPos.length - 1].x : -1;
        if (tempoAnimacao > ultimoTempoPos || (tempoAnimacao === 0 && ultimoTempoPos === -1 && dadosGraficoPos.length <=1 ) ) {
             dadosGraficoPos.push({ x: tempoAnimacao, y: particula.s });
             dadosGraficoVel.push({ x: tempoAnimacao, y: particula.v });
        }
    }
    
    if (animCanvas) desenharAnimacao();
    if (posGraphCanvas) desenharGrafico(posGraphCanvas, dadosGraficoPos, minPos, maxPos, "Posição (m)", COR_GRAF_POS, tempoTotalSimulacao);
    if (velGraphCanvas) desenharGrafico(velGraphCanvas, dadosGraficoVel, minVel, maxVel, "Velocidade (m/s)", COR_GRAF_VEL, tempoTotalSimulacao);
    
    // A atualização do tempo só ocorre se a simulação estiver rodando e não pausada.
    // A chamada a noLoop() em pausarSimulacao() já impede que draw() execute esta parte.
    tempoAnimacao += deltaTAnim;
    if (tempoAnimacao > tempoTotalSimulacao) {
        tempoAnimacao = tempoTotalSimulacao; // Garante que não ultrapasse
    }
}

/*!
 * \brief Desenha a animação da partícula no canvas principal (`animCanvas`).
 *
 * Limpa o fundo do canvas. Se a partícula não existir, retorna.
 * Mapeia a posição da partícula (`particula.s`) para coordenadas visuais no canvas,
 * considerando os valores `minPos` e `maxPos` para a escala.
 * Desenha uma linha representando o eixo de movimento.
 * Desenha a partícula como uma elipse na sua posição visual.
 * Se houver instantes de inversão, calcula suas posições e as marca com elipses menores.
 * Exibe texto com os valores atuais de posição, velocidade e tempo da animação.
 */
function desenharAnimacao() {
    background(220); 

    if (!particula) {
        return;
    }
    let yParticulaVisual = height / 2; 
    let sMinVisual = minPos;
    let sMaxVisual = maxPos;

    if (abs(sMaxVisual - sMinVisual) < 1) { 
        sMinVisual -= 5; 
        sMaxVisual += 5; 
    }
    let xParticulaVisual = map(particula.s, sMinVisual, sMaxVisual, 20, width - 20); 

    stroke(COR_EIXO);
    strokeWeight(1);
    line(0, yParticulaVisual + 15, width, yParticulaVisual + 15); 

    fill(COR_PARTICULA);
    noStroke();
    ellipse(xParticulaVisual, yParticulaVisual, 20, 20); 

    if(elInversao && elInversao.html().includes(":") && elInversao.html().split(':')[1].trim() !== "Nenhum detectado nos intervalos.") { 
        let instInversaoTexto = elInversao.html();
        let temposInv = instInversaoTexto.split(':')[1].trim().split('s')[0].split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));
        
        temposInv.forEach(tInv => {
            if (tInv >= 0) { 
                 let sInv = calcularPosicaoEmTempoGlobal(tInv); 
                 let xInvVisual = map(sInv, sMinVisual, sMaxVisual, 20, width - 20);
                 fill(COR_INVERSAO);
                 ellipse(xInvVisual, yParticulaVisual - 10, 10, 10); 
            }
        });
    }

    fill(0); // Cor do texto
    noStroke();
    textAlign(LEFT, BOTTOM);
    textSize(12);
    text(`s = ${particula.s.toFixed(2)}m, v = ${particula.v.toFixed(2)}m/s, t = ${tempoAnimacao.toFixed(2)}s`, 5, height - 5);
}

/*!
 * \brief Calcula a posição da partícula em um tempo global específico da simulação.
 *
 * Esta função é usada para determinar a posição exata em um dado `tGlobal`,
 * considerando as diferentes acelerações e durações de cada intervalo.
 * É útil para marcar pontos específicos na animação ou gráficos, como os de inversão.
 * \param tGlobal O tempo global (desde t=0 da simulação) para o qual a posição será calculada.
 * \return A posição calculada da partícula no tempo `tGlobal`. Retorna `s0` se `tGlobal` for negativo ou zero.
 */
function calcularPosicaoEmTempoGlobal(tGlobal) {
    if (tGlobal < 0) return s0; 
    if (abs(tGlobal) < 1e-9) return s0;

    let s_calc = s0;
    let v_calc = v0;
    let t_restante = tGlobal;

    for (let i = 0; i < 3; i++) {
        if (t_restante <= 1e-9) break; 
        let dt_intervalo_atual = min(t_restante, dt[i]);
        s_calc = s_calc + v_calc * dt_intervalo_atual + 0.5 * a[i] * dt_intervalo_atual * dt_intervalo_atual;
        v_calc = v_calc + a[i] * dt_intervalo_atual;
        t_restante -= dt_intervalo_atual;
        if (t_restante < -1e-9) { 
            break;
        }
    }
    return s_calc;
}

/*!
 * \brief Desenha um gráfico (posição vs. tempo ou velocidade vs. tempo) em um objeto p5.Graphics.
 *
 * A função realiza as seguintes etapas:
 * 1. Verifica se o objeto gráfico (`pg`) é válido.
 * 2. Limpa o fundo do gráfico.
 * 3. Ajusta `yMin` e `yMax` se o intervalo entre eles for muito pequeno, para evitar divisões por zero.
 * 4. Desenha linhas de grade horizontais e verticais.
 * 5. Desenha os eixos X (tempo) e Y (posição ou velocidade).
 * 6. Adiciona rótulos textuais para os eixos e marcas de valor ao longo dos eixos.
 * 7. Se houver dados, desenha a linha principal do gráfico conectando os pontos de dados.
 * 8. Se houver instantes de inversão, marca esses pontos no gráfico (posição 0 para velocidade, ou a posição correspondente para o gráfico de posição).
 *
 * \param pg O objeto p5.Graphics (canvas off-screen) onde o gráfico será desenhado.
 * \param dados Um array de objetos, onde cada objeto tem propriedades `x` (tempo) e `y` (posição ou velocidade).
 * \param yMin O valor mínimo para a escala do eixo Y.
 * \param yMax O valor máximo para a escala do eixo Y.
 * \param labelY Uma string para o rótulo do eixo Y (ex: "Posição (m)").
 * \param corLinha Um array RGB definindo a cor da linha principal do gráfico.
 * \param xMaxTotal O valor máximo para a escala do eixo X (geralmente o tempo total da simulação).
 */
function desenharGrafico(pg, dados, yMin, yMax, labelY, corLinha, xMaxTotal) {
    if (!pg || typeof pg.background !== 'function' || !pg.width || !pg.height) { // Adicionado !pg.width || !pg.height
        console.warn(`desenharGrafico: pg inválido, sem dimensões, ou sem background() para ${labelY}. pg:`, pg, `Saindo.`);
        return;
    }
    
    console.log(`--- Início desenharGrafico para "${labelY}" ---`);
    console.log(`  pg.width: ${pg.width}, pg.height: ${pg.height}, MARGEM_GRAFICO: ${MARGEM_GRAFICO}`);
    console.log(`  Valores recebidos: yMin: ${yMin}, yMax: ${yMax}, xMaxTotal: ${xMaxTotal}`);
    console.log(`  Número de pontos de dados: ${dados ? dados.length : 'null'}`);

    pg.background(245); 
    const COR_GRADE = [180, 180, 180]; 
    pg.stroke(COR_GRADE);
    pg.strokeWeight(1); 

    // Salvar yMin/yMax originais para logs
    let originalYMin = yMin;
    let originalYMax = yMax;

    if (abs(yMax - yMin) < 1e-6) { 
        console.log(`  Ajustando yMin/yMax para "${labelY}" pois range é muito pequeno.`);
        yMax +=1; yMin -=1; 
    }
    
    if (pg.height <= MARGEM_GRAFICO * 2) {
        console.warn(`  Altura do gráfico (${pg.height}) muito pequena para margens (${MARGEM_GRAFICO*2}) em "${labelY}". Grades/eixos podem não aparecer.`);
    }
    if (pg.width <= MARGEM_GRAFICO * 2) {
        console.warn(`  Largura do gráfico (${pg.width}) muito pequena para margens (${MARGEM_GRAFICO*2}) em "${labelY}". Grades/eixos podem não aparecer.`);
    }


    // Linhas de grade horizontais
    if (pg.height > MARGEM_GRAFICO * 2) { 
        console.log(`  Desenhando grades horizontais para "${labelY}"...`);
        for (let i = 0; i <= 5; i++) {
            let val = lerp(yMin, yMax, i / 5);
            let yCoord = map(val, yMin, yMax, pg.height - MARGEM_GRAFICO, MARGEM_GRAFICO);
            console.log(`    H-Grid ${i}: val=${val.toFixed(2)}, y_coord=${yCoord.toFixed(2)} (de ${pg.height - MARGEM_GRAFICO} a ${MARGEM_GRAFICO})`);
            pg.line(MARGEM_GRAFICO, yCoord, pg.width - MARGEM_GRAFICO, yCoord);
        }
    }

    let xRangeParaMarcasGrade = xMaxTotal > 0 ? xMaxTotal : (dados && dados.length > 0 ? dados[dados.length-1].x : 1);
    if (abs(xRangeParaMarcasGrade) < 1e-6 && xMaxTotal > 0) xRangeParaMarcasGrade = xMaxTotal;
    else if (abs(xRangeParaMarcasGrade) < 1e-6) xRangeParaMarcasGrade = 1;
    console.log(`  xRangeParaMarcasGrade para "${labelY}": ${xRangeParaMarcasGrade}`);
    
    // Linhas de grade verticais
    if (pg.width > MARGEM_GRAFICO * 2) { 
        console.log(`  Desenhando grades verticais para "${labelY}"...`);
        for (let i = 0; i <= 5; i++) {
            let val = lerp(0, xRangeParaMarcasGrade, i / 5);
            let xCoord = map(val, 0, xRangeParaMarcasGrade, MARGEM_GRAFICO, pg.width - MARGEM_GRAFICO);
            console.log(`    V-Grid ${i}: val=${val.toFixed(2)}, x_coord=${xCoord.toFixed(2)} (de ${MARGEM_GRAFICO} a ${pg.width - MARGEM_GRAFICO})`);
            pg.line(xCoord, MARGEM_GRAFICO, xCoord, pg.height - MARGEM_GRAFICO);
        }
    }

    // Eixos
    pg.stroke(COR_EIXO);
    pg.strokeWeight(1); 
    console.log(`  Desenhando Eixo Y para "${labelY}": line(${MARGEM_GRAFICO}, ${MARGEM_GRAFICO}, ${MARGEM_GRAFICO}, ${pg.height - MARGEM_GRAFICO})`);
    pg.line(MARGEM_GRAFICO, MARGEM_GRAFICO, MARGEM_GRAFICO, pg.height - MARGEM_GRAFICO); 
    console.log(`  Desenhando Eixo X para "${labelY}": line(${MARGEM_GRAFICO}, ${pg.height - MARGEM_GRAFICO}, ${pg.width - MARGEM_GRAFICO}, ${pg.height - MARGEM_GRAFICO})`);
    pg.line(MARGEM_GRAFICO, pg.height - MARGEM_GRAFICO, pg.width - MARGEM_GRAFICO, pg.height - MARGEM_GRAFICO); 

    // Textos dos eixos e rótulos
    pg.fill(COR_EIXO);
    pg.noStroke(); // Importante para não ter contorno no texto
    pg.textAlign(CENTER, CENTER);
    pg.textSize(10); // Reduzir um pouco o tamanho da fonte para caber melhor
    pg.text(labelY, MARGEM_GRAFICO / 2, MARGEM_GRAFICO / 3); // Ajustar posição do label Y
    
    pg.textAlign(CENTER, TOP); 
    pg.text("Tempo (s)", pg.width / 2, pg.height - MARGEM_GRAFICO / 1.2); // Ajustar posição do label X

    // Rótulos dos valores nos eixos
    if (pg.height > MARGEM_GRAFICO * 2) {
        for (let i = 0; i <= 5; i++) {
            let val = lerp(yMin, yMax, i / 5);
            let y = map(val, yMin, yMax, pg.height - MARGEM_GRAFICO, MARGEM_GRAFICO);
            pg.textAlign(RIGHT, CENTER);
            pg.text(val.toFixed(1), MARGEM_GRAFICO - 5, y); // Ajustar margem do texto
        }
    }
    
    if (pg.width > MARGEM_GRAFICO * 2) {
        for (let i = 0; i <= 5; i++) {
            let val = lerp(0, xRangeParaMarcasGrade, i / 5);
            let x = map(val, 0, xRangeParaMarcasGrade, MARGEM_GRAFICO, pg.width - MARGEM_GRAFICO);
            pg.textAlign(CENTER, TOP);
            pg.text(val.toFixed(1), x, pg.height - MARGEM_GRAFICO + 5); // Ajustar margem do texto
        }
    }

    if (!dados || dados.length < 1) {
        console.log(`  Sem dados para desenhar a linha do gráfico "${labelY}".`);
        console.log(`--- Fim desenharGrafico para "${labelY}" ---`);
        return;
    }
    
    // Desenhar linha de dados
    pg.noFill();
    pg.stroke(corLinha);
    pg.strokeWeight(2); 
    console.log(`  Desenhando linha de dados para "${labelY}" com ${dados.length} pontos.`);
    
    pg.beginShape();
    for (let i = 0; i < dados.length; i++) {
        let ponto = dados[i];
        if (typeof ponto.x !== 'number' || typeof ponto.y !== 'number' || isNaN(ponto.x) || isNaN(ponto.y)) {
            console.warn(`    Ponto de dados inválido em "${labelY}" no índice ${i}:`, ponto);
            continue;
        }
        let x = map(ponto.x, 0, xRangeParaMarcasGrade, MARGEM_GRAFICO, pg.width - MARGEM_GRAFICO);
        let y = map(ponto.y, yMin, yMax, pg.height - MARGEM_GRAFICO, MARGEM_GRAFICO);
        // console.log(`    Ponto ${i}: (${ponto.x.toFixed(2)}, ${ponto.y.toFixed(2)}) -> (${x.toFixed(2)}, ${y.toFixed(2)})`);
        pg.vertex(x, y);
    }
    pg.endShape();

    // Desenhar pontos de inversão (se aplicável)
    // ... (código dos pontos de inversão como antes, talvez adicionar logs aqui também se necessário) ...
    if(elInversao && elInversao.html().includes(":") && elInversao.html().split(':')[1].trim() !== "Nenhum detectado nos intervalos.") {
        let instInversaoTexto = elInversao.html();
        let temposInv = instInversaoTexto.split(':')[1].trim().split('s')[0].split(',').map(t => parseFloat(t.trim())).filter(t => !isNaN(t));
        temposInv.forEach(tInv => {
            if (tInv >= 0) {
                let sInv = calcularPosicaoEmTempoGlobal(tInv); 
                let vInv = 0; 
                let xPt = map(tInv, 0, xRangeParaMarcasGrade, MARGEM_GRAFICO, pg.width - MARGEM_GRAFICO);
                let yPt;

                pg.fill(COR_INVERSAO);
                pg.noStroke();
                if (labelY.includes("Posição")) {
                    yPt = map(sInv, yMin, yMax, pg.height - MARGEM_GRAFICO, MARGEM_GRAFICO);
                    pg.ellipse(xPt, yPt, 6, 6);
                } else if (labelY.includes("Velocidade")) {
                    yPt = map(vInv, yMin, yMax, pg.height - MARGEM_GRAFICO, MARGEM_GRAFICO);
                     pg.ellipse(xPt, yPt, 6, 6);
                }
            }
        });
    }
    console.log(`--- Fim desenharGrafico para "${labelY}" ---`);
}

/*!
 * \brief Função de callback executada quando a janela do navegador é redimensionada.
 *
 * Redimensiona o canvas de animação (`animCanvas`) e os objetos gráficos
 * (`posGraphCanvas`, `velGraphCanvas`) para se ajustarem à nova largura de seus
 * respectivos contêineres HTML. Após o redimensionamento, redesenha a animação
 * e os gráficos para refletir as novas dimensões e garantir que o conteúdo
 * seja exibido corretamente.
 */
function windowResized() {
    console.log("windowResized() chamado.");
    let canvasContainer = select('#canvasContainer');
    if (canvasContainer && animCanvas && typeof animCanvas.resize === 'function') {
        console.log("WINDOW_RESIZED: canvasContainer.width:", canvasContainer.width); // LOG ADICIONADO
        animCanvas.resize(max(1, canvasContainer.width), 200);
    }

    let posGraphContainer = select('#posGraphContainer');
    if (posGraphContainer && posGraphCanvas && typeof posGraphCanvas.resize === 'function') {
        console.log("WINDOW_RESIZED: posGraphContainer.width:", posGraphContainer.width); // LOG ADICIONADO
        posGraphCanvas.resize(max(1, posGraphContainer.width), 150); 
    }
    
    let velGraphContainer = select('#velGraphContainer');
    if (velGraphContainer && velGraphCanvas && typeof velGraphCanvas.resize === 'function') {
        console.log("WINDOW_RESIZED: velGraphContainer.width:", velGraphContainer.width); // LOG ADICIONADO
        velGraphCanvas.resize(max(1, velGraphContainer.width), 150); 
    }
        if (particula && animCanvas) { 
            desenharAnimacao();
        }
        if (dadosGraficoPos.length > 0 && posGraphCanvas) {
            desenharGrafico(posGraphCanvas, dadosGraficoPos, minPos, maxPos, "Posição (m)", COR_GRAF_POS, tempoTotalSimulacao);
        }
        if (dadosGraficoVel.length > 0 && velGraphCanvas) {
            desenharGrafico(velGraphCanvas, dadosGraficoVel, minVel, maxVel, "Velocidade (m/s)", COR_GRAF_VEL, tempoTotalSimulacao);
        }
}

/*!
 * \brief Função auxiliar chamada após um atraso para garantir que o DOM esteja pronto.
 *
 * Esta função simplesmente chama `windowResized()` para realizar o ajuste inicial
 * das dimensões dos canvases com base nos seus contêineres HTML. O atraso
 * ajuda a garantir que os elementos HTML já tenham sido renderizados e suas dimensões
 * calculadas pelo navegador.
 */
function drawDOM() { 
    console.log("drawDOM() chamado, que por sua vez chama windowResized().");
    windowResized();
}
setTimeout(drawDOM, 250);