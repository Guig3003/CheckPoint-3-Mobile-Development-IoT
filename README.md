# IoT Control

Aplicativo mobile de monitoramento e controle de um ambiente IoT simulado. O projeto usa React Native, Expo e TypeScript para receber temperatura e umidade em tempo real, enviar comandos para uma lâmpada virtual e acompanhar as mensagens trocadas por MQTT.

| Nome completo | RM |
|---|---|
| Guilherme Gomes Oliveira | RM554606 |

## Funcionalidades

- conexão e desconexão manual de um broker MQTT por WebSocket;
- indicação dos estados `conectando`, `conectado`, `desconectado` e `erro`;
- reconexão automática e ação explícita para reconectar;
- atualização em tempo real de temperatura e umidade, com horário da última leitura;
- comandos **Ligar** e **Desligar** para uma lâmpada virtual;
- atualização do estado da lâmpada somente após a confirmação recebida do simulador;
- validação de payloads antes de atualizar a interface;
- histórico em memória das 10 mensagens mais recentes, com direção, tópico, payload, horário e validade;
- URL do broker e preferência Light/Dark persistidas com AsyncStorage;
- três áreas de navegação: Dashboard, Histórico e Configurações;
- simulador Node.js incluído para reproduzir o ciclo completo sem hardware físico.

## Tecnologias e versões

| Tecnologia | Versão usada |
|---|---:|
| Expo SDK | `~58.0.19` |
| React Native | `0.88.0` |
| React | `19.3.0` |
| TypeScript | `~6.0.3` |
| Expo Router | `~58.0.26` |
| MQTT.js | `^5.16.1` |
| AsyncStorage | `2.2.0` |

O MQTT.js utiliza o WebSocket nativo do ambiente. Assim, a conexão do aplicativo usa obrigatoriamente `ws://` ou `wss://`; uma porta MQTT TCP comum, como `1883`, não funciona diretamente no app.

## Pré-requisitos

- Node.js `22.13` ou superior;
- npm;
- Expo Go em um aparelho Android/iOS, ou emulador compatível;
- acesso à internet para o broker público e a instalação das dependências.

## Instalação e execução

Clone o repositório e, na raiz do projeto, execute:

```bash
npm install
npm start
```

No terminal do Expo:

- leia o QR Code com o Expo Go para abrir em um aparelho físico;
- pressione `a` para Android;
- pressione `i` para iOS em um ambiente macOS compatível;
- pressione `w` para a versão web opcional.

Também estão disponíveis:

```bash
npm run android
npm run ios
npm run web
```

> No PowerShell com execução de scripts desabilitada, use `npm.cmd` no lugar de `npm`, por exemplo `npm.cmd start`.

## Configuração MQTT

O aplicativo inicia com o endpoint público de demonstração:

```text
wss://broker.emqx.io:8084/mqtt
```

Esse endereço usa MQTT sobre **WebSocket seguro**, na porta `8084` e no caminho `/mqtt`. A URL pode ser alterada e persistida na tela **Configurações**.

O prefixo padrão dos tópicos é:

```text
fiap/3espx/iot-control-guilherme-oliveira
```

Ele foi escolhido para reduzir interferência com outros projetos no broker público. Se o identificador oficial do grupo for outro, altere o prefixo em `src/config/mqtt.ts` e use exatamente o mesmo valor no simulador.

### Tópicos e payloads

| Tópico | Direção no app | Payload esperado | Uso |
|---|---|---|---|
| `fiap/3espx/iot-control-guilherme-oliveira/sensor/temperatura` | Recebida (subscribe) | `{"value":24.5}` | Leitura de temperatura em °C |
| `fiap/3espx/iot-control-guilherme-oliveira/sensor/umidade` | Recebida (subscribe) | `{"value":58}` | Umidade relativa em % |
| `fiap/3espx/iot-control-guilherme-oliveira/lampada/comando` | Enviada (publish) | `{"action":"ON"}` ou `{"action":"OFF"}` | Solicitação de mudança da lâmpada |
| `fiap/3espx/iot-control-guilherme-oliveira/lampada/estado` | Recebida (subscribe) | `{"state":"ON"}` ou `{"state":"OFF"}` | Confirmação do estado real |

As mensagens de temperatura precisam conter um `value` numérico finito. A umidade também deve estar entre 0 e 100. O estado e o comando da lâmpada aceitam apenas `ON` e `OFF`. Payloads inválidos são ignorados pela telemetria, registrados no histórico como inválidos e não derrubam o aplicativo.

## Simulador do dispositivo

O simulador em `simulator/device-simulator.mjs` usa o mesmo broker e prefixo do aplicativo. Ele publica telemetria periodicamente, assina o tópico de comando e publica a confirmação no tópico de estado.

Abra um segundo terminal na raiz do projeto e execute:

```bash
npm run simulator
```

Para usar outro broker ou prefixo, defina variáveis de ambiente antes de iniciar.

PowerShell:

```powershell
$env:MQTT_URL = "wss://seu-broker:porta/mqtt"
$env:MQTT_TOPIC_PREFIX = "fiap/turma/seu-grupo"
npm.cmd run simulator
```

Bash/Zsh:

```bash
MQTT_URL="wss://seu-broker:porta/mqtt" \
MQTT_TOPIC_PREFIX="fiap/turma/seu-grupo" \
npm run simulator
```

### Roteiro reproduzível de demonstração

1. Inicie o aplicativo e aguarde o status **Conectado**.
2. Inicie o simulador com `npm run simulator`.
3. Observe novas leituras de temperatura e umidade no Dashboard, sem atualizar manualmente.
4. Toque em **Ligar**.
5. O app publica `{"action":"ON"}`; o simulador recebe o comando e responde com `{"state":"ON"}`.
6. Confirme que o app só então exibe a lâmpada como **Ligada**.
7. Repita o fluxo com **Desligar** e `OFF`.
8. Abra **Histórico** e verifique as mensagens enviadas e recebidas, limitadas às 10 mais recentes.
9. Troque o tema ou a URL, feche e abra o aplicativo e confirme que a preferência foi restaurada.

## Organização do projeto

```text
src/
  app/                    # rotas e abas do Expo Router
  components/             # cartões, status e itens reutilizáveis
  config/                 # broker e tópicos MQTT
  context/                # estado compartilhado e ciclo de vida do MQTT
  screens/                # Dashboard, Histórico e Configurações
  services/
    mqttService.ts        # conexão, listeners, subscriptions e publicação
    storageService.ts     # persistência com AsyncStorage
  themes/                 # paletas Light/Dark
  types/                  # tipos de conexão, mensagens e telemetria
  utils/                  # validação segura dos payloads
simulator/
  device-simulator.mjs    # dispositivo virtual reproduzível
```

A camada de telas não manipula o cliente MQTT diretamente. Um contexto no topo da aplicação coordena preferências, leituras e histórico; o serviço MQTT mantém uma única instância ativa, reassina os tópicos após reconexão e remove listeners/subscriptions no encerramento para evitar eventos duplicados.

## Telas

### Dashboard

Mostra o estado da conexão, a última temperatura, a última umidade, o estado confirmado da lâmpada e os controles ON/OFF.

### Histórico

Lista as 10 mensagens mais recentes, ordenadas da mais nova para a mais antiga, diferenciando mensagens enviadas e recebidas.

### Configurações

Permite editar e salvar a URL WebSocket, conectar/desconectar do broker, alternar o tema e consultar os tópicos utilizados.

## Capturas de tela

> [!WARNING]
> **PENDENTE ANTES DA ENTREGA:** substitua os marcadores abaixo por capturas reais do aplicativo em execução. Não foram adicionadas imagens fictícias.

| Tela | Arquivo a adicionar | O que deve aparecer |
|---|---|---|
| Dashboard | `docs/images/dashboard.png` | sensores, conexão e lâmpada |
| Histórico | `docs/images/historico.png` | mensagens enviadas e recebidas |
| Configurações Light | `docs/images/configuracoes-light.png` | broker e tema claro |
| Configurações Dark | `docs/images/configuracoes-dark.png` | persistência e tema escuro |

Depois de criar os arquivos, remova os comentários e habilite as imagens abaixo:

```md
![Dashboard](docs/images/dashboard.png)
![Histórico](docs/images/historico.png)
![Configurações — Light](docs/images/configuracoes-light.png)
![Configurações — Dark](docs/images/configuracoes-dark.png)
```

## Validação antes da entrega

Execute as verificações estáticas:

```bash
npx tsc --noEmit
npx expo lint
npx expo-doctor
```

Depois, valide manualmente em Android e iOS o roteiro completo com o simulador. A versão web é complementar e depende do suporte do navegador ao WebSocket do broker.

## Tratamento de conexão e erros

- URLs que não começam com `ws://` ou `wss://` são rejeitadas antes da conexão.
- Uma publicação desconectada não é silenciosa: a interface informa que é necessário conectar.
- A reconexão é automática após quedas transitórias; também existe uma ação manual.
- A inscrição nos tópicos ocorre a cada conexão bem-sucedida, sem acumular listeners.
- Mensagens malformadas não alteram os valores válidos já exibidos.
- O estado visual da lâmpada nunca é atualizado de forma otimista pelo toque; depende do tópico `lampada/estado`.

## Limitações e segurança

- O broker EMQX indicado é público e compartilhado; não envie informações sensíveis.
- O projeto não armazena senhas, tokens ou credenciais no repositório.
- Brokers privados que exigem autenticação precisam de configuração adicional; credenciais devem ser fornecidas por variáveis seguras, nunca versionadas.
- O histórico contém somente as 10 últimas mensagens da sessão e não é persistido.
- A telemetria é simulada e não representa um sensor físico calibrado.
- O monitoramento foi projetado para uso com o app em primeiro plano; execução contínua em background não faz parte do escopo.
- As capturas reais e a validação final em aparelhos/emuladores ainda devem ser feitas pela equipe antes da entrega.

## Checklist de entrega

- [ ] Nomes completos e RMs substituíram os placeholders no topo deste arquivo.
- [ ] Prefixo MQTT corresponde ao identificador definitivo do grupo.
- [ ] O app conecta por WSS e mostra conexão/erros.
- [ ] Temperatura e umidade chegam em tempo real pelo simulador.
- [ ] ON/OFF funciona com confirmação recebida do estado.
- [ ] O histórico mantém no máximo 10 mensagens.
- [ ] URL e tema permanecem após reiniciar o app.
- [ ] Temas Light e Dark foram conferidos em todas as telas.
- [ ] Não há listeners duplicados após reconectar.
- [ ] As capturas reais foram adicionadas ao README.
- [ ] TypeScript, lint e Expo Doctor foram executados sem erro.
- [ ] O repositório GitHub está público ou acessível ao professor.

## Referências

- [Enunciado do Checkpoint 3](https://github.com/anderltda/doc-react-native/blob/main/CPS/3ESPX/Segundo%20Semestre/README_TRABALHO_REACT_NATIVE_MQTT.md)
- [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [MQTT.js — suporte a React Native](https://github.com/mqttjs/MQTT.js#react-native)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## Como parar o aplicativo

Para parar o servidor Expo, volte ao terminal em que ele esta rodando e pressione `Ctrl + C`.

Se o simulador estiver em outro terminal, pare-o tambem com `Ctrl + C`. Isso encerra o processo Node.js e a conexao MQTT. Fechar a aba do navegador ou o Expo Go nao encerra necessariamente o servidor Expo.

## Como o projeto foi feito

- O projeto foi criado com React Native, Expo SDK 58, TypeScript e Expo Router.
- As rotas ficam em `src/app/` e organizam as telas em tres abas: Dashboard, Historico e Configuracoes.
- O `IoTContext` centraliza o estado da conexao, sensores, lampada, historico, tema e preferencias.
- O servico `src/services/mqttService.ts` separa a comunicacao MQTT da interface, conecta por WebSocket, assina os topicos e remove listeners ao desconectar.
- O `src/utils/messageParser.ts` valida os payloads recebidos antes de atualizar a interface.
- O `storageService.ts` utiliza AsyncStorage para persistir a URL do broker e o tema escolhido.
- O simulador Node.js publica temperatura e umidade periodicamente, recebe comandos ON/OFF e publica a confirmacao do estado da lampada.
- Os componentes reutilizaveis usam `StyleSheet`, Flexbox e paletas separadas para os temas claro e escuro.

## Entrega

Envie somente o link deste repositório GitHub na tarefa correspondente do Microsoft Teams. Não substitua o repositório por arquivo ZIP; vídeo e apresentação não são exigidos pelo enunciado.
