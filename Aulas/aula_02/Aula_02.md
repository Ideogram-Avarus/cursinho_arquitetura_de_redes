# Aula 02

## Modelos TCP/IP & OSI 

O modelo TCP/IP foi concebido por Vint Cerf e Bob Kahn na década de 1970, com financiamento e incentivo da DARPA (Agência de Projetos de Pesquisa Avançada de Defesa dos EUA) para a antiga ARPANET.

O modelo OSI de 7 camadas foi definido e formalizado pela ISO (International Organization for Standardization) em conjunto com o antigo CCITT (International Telegraph and Telephone Consultative Committee, atual ITU-T), sendo publicado oficialmente em 1984 (como a norma ISO 7498).

Resumo dos Modelos

• TCP/IP (4 camadas): Focado na prática e na operação real da internet (Acesso à Rede, Internet, Transporte e Aplicação).
• OSI (7 camadas): Criado como um modelo teórico e conceitual de referência para padronização e estudo de redes de computadores (Física, Enlace, Rede, Transporte, Sessão, Apresentação e Aplicação).

## TCP versus UDP: a parte que vale entender de verdade

Essa distinção é importante porque afeta diretamente o comportamento das aplicações.

O TCP e o UDP são protocolos da camada de transporte. Eles permitem que aplicações se comuniquem por meio de portas, mas oferecem serviços diferentes.

### UDP: transporte simples, sem garantia de entrega

O UDP tem menos mecanismos incorporados. Ele envia datagramas sem estabelecer previamente uma conexão UDP e não garante que os dados chegarão, chegarão uma única vez ou chegarão na ordem de envio.

Isso não significa que o UDP seja sempre mais rápido, nem que não possa ser usado em aplicações confiáveis. Significa que a confiabilidade, se necessária, precisa ser providenciada por outras partes do sistema.

Exemplos de uso incluem:
- DNS, em muitas consultas convencionais.
- Comunicação em tempo real, como voz e vídeo.
- Jogos online que priorizam atualizações recentes de posição.


### TCP: comunicação confiável e ordenada

O TCP foi projetado para oferecer um fluxo de bytes confiável e ordenado entre dois pontos da comunicação.

Entre suas características estão:
- Confirmação de recebimento: utiliza confirmações para acompanhar os dados recebidos.
- Retransmissão: tenta recuperar dados perdidos.
- Ordenação: entrega os bytes à aplicação na sequência correta.
- Controle de fluxo: evita enviar dados indefinidamente mais rápido do que o receptor consegue receber.
- Controle de congestionamento: ajusta o envio em resposta às condições da rede.
Antes de transmitir dados, normalmente estabelece uma conexão por meio do three-way handshake.


O estabelecimento de uma conexão TCP
Representação simplificada das três etapas do handshake TCP.


1. Cliente solicita conexão, e envia o número de sequência inicial, 
2. Servidor aceita e confirma informando o cliente do número recebido e o seu próprio número de sequência inicial, 
3. Cliente recebe e confirma com o servidor o número de sequencia que ele recebeu do servidor.

SYN — Synchronize: sincroniza os números de sequência usados na conexão.
SYN-ACK: combina os dois sinalizadores; o servidor sincroniza sua sequência e confirma o SYN do cliente.
ACK — Acknowledgment: indica confirmação de recebimento de informações.


## Sobre o HTTP:

Existem 5 versões principais do protocolo HTTP ao longo de sua história:
• HTTP/0.9 (1991): Versão inicial extremamente simples que suportava apenas o método GET e transferia apenas texto em ASCII.
• HTTP/1.0 (1996): Introduziu cabeçalhos, códigos de status, suporte a outros métodos (como POST e HEAD) e tipos MIME.
• HTTP/1.1 (1997/1999): O padrão mais duradouro da web; trouxe conexões persistentes, cabeçalho Host obrigatório e melhorias robustas de cache.
• HTTP/2 (2015): Substituiu o formato textual por binário, permitiu a multiplexação (várias requisições em uma única conexão) e compactação de cabeçalhos.
• HTTP/3 (2022): A versão mais recente, que abandona o TCP e passa a usar o protocolo QUIC sobre UDP para reduzir drasticamente a latência e resolver problemas de perda de pacotes

Como funciona o QUIC:

1. Negociação de chaves
O cliente e o servidor executam o handshake do TLS 1.3 para estabelecer chaves criptográficas compartilhadas e autenticar o servidor.
2. Criptografia dos pacotes
O QUIC usa essas chaves para criptografar os dados e detectar alterações não autorizadas nos pacotes.
3. Verificação na recepção
O destinatário verifica a proteção criptográfica e recupera os dados originais. Pacotes adulterados não passam pela verificação de integridade.


## Sobre Criptografia & HTTPS:

1. Criptografia assimétrica: chave pública e privada.

Existem duas chaves. Uma pública, outra privada. 
Algo que foi criptografado por uma chave pública, só pode ser decriptografado pela chave privada.
Algo que foi criptografado pela chave privada, só pode ser decriptografado pela chave pública.

Intenção: Ajuda a autenticar o servidor e estabelecer coneções seguras.

1. Criptografia simétrica: chave compartilhada.
Os dois lados tem a mesma chave. Ela criptografa e decriptografa o conteúdo. 

EXEMPLO: JWT