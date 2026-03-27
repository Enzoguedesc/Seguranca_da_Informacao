# 🛡️ Anotações de Segurança da Informação

## 🌐 1. Protocolo de Aplicação
A camada de aplicação é onde residem os protocolos que os programas (browsers, clientes de e-mail) utilizam para comunicar dados inteligíveis ao usuário.

### **DNS (Domain Name System)**
* **Função:** Traduz nomes de domínio (**FQDN**, ex: `google.com`) em endereços **IP**.
* **Porta:** 53 (UDP para consultas rápidas, TCP para transferências de zona).
* **Segurança:** Vulnerável a *DNS Spoofing* (envenenamento de cache), onde o atacante desvia o tráfego para um IP falso.

### **HTTP vs HTTPS**
* **HTTP (Porta 80):** Protocolo de transferência de hipertexto em texto puro. Dados como senhas viajam sem proteção.
* **HTTPS (Porta 443):** É o HTTP sobre uma camada de segurança (**TLS/SSL**). Garante:
    1.  **Confidencialidade:** Dados criptografados.
    2.  **Integridade:** Os dados não foram alterados no caminho.
    3.  **Autenticidade:** Prova que o site é quem diz ser via Certificado Digital.

### **Protocolos de Correio Eletrônico**
* **SMTP (Porta 25/587):** Protocolo para **envio** (saída) de e-mails.
* **IMAP (Porta 143/993):** Protocolo para **leitura/recebimento**. Sincroniza as mensagens com o servidor (se você apagar no celular, apaga no PC).
* **POP3 (Porta 110/995):** Baixa as mensagens para a máquina local e, geralmente, as remove do servidor.

### **Acesso Remoto Seguro**
* **SSH (Secure Shell - Porta 22):** Substituiu o Telnet. Permite administrar servidores remotamente com criptografia forte.

---

## 🚛 2. Protocolo de Transporte
Responsável por como os dados são levados de um ponto A a um ponto B. Aqui definimos a **Porta** (identificador da aplicação).

### **TCP (Transmission Control Protocol)**
O TCP é um protocolo **orientado à conexão**. Para garantir que ambos os lados estão prontos, ele realiza um processo de 3 etapas antes de enviar qualquer dado real.
* **Confiável:** Garante que os dados cheguem na ordem e sem erros.
* **Orientado à Conexão:** Utiliza o processo de **Three-Way Handshake**:
    1.  **SYN** (Cliente solicita conexão)
    2.  **SYN-ACK** (Servidor aceita e confirma)
    3.  **ACK** (Cliente confirma o recebimento)
* **Uso:** Web, E-mail, Transferência de arquivos.

### **UDP (User Datagram Protocol)**
O UDP é o protocolo da "velocidade". Diferente do TCP, ele não estabelece uma sessão formal antes de enviar dados.
* **Não Confiável:** Não verifica se os dados chegaram. "Envia e esquece".
* **Sem Conexão:** Não há aperto de mão (handshake), o que o torna muito mais rápido.
* **Uso:** Streaming de vídeo, VoIP (voz), Jogos online e DNS.
  
#### **Vantagens Principais**
* **Baixa Latência:** Sem o atraso do "aperto de mão" (handshake) inicial.
* **Sem Retransmissão:** Se um pacote se perde, o protocolo não tenta recuperá-lo. Isso evita "travamentos" em transmissões ao vivo.
* **Menor Sobrecarga (Overhead):** O cabeçalho do UDP tem apenas **8 bytes**, contra os 20 bytes (mínimo) do TCP.
* **Broadcast/Multicast:** Capacidade de enviar dados para vários destinos simultaneamente.

---

## 🔑 Conceitos Importantes para Segurança

**O que é um Socket?**  
É a combinação de: `Endereço IP` + `Protocolo (TCP/UDP)` + `Porta`.   
*Exemplo: 192.168.0.1:443 (TCP)*

## 🤝 Estabelecimento de Conexão TCP (Three-Way Handshake)

### **As 3 Etapas:**
1.  **SYN (Synchronize):** O Cliente envia um pacote com a flag `SYN` ativa e um número de sequência aleatório ($X$).
    * *Mensagem:* "Quero iniciar uma conexão. Meu número é X."
2.  **SYN-ACK (Synchronize-Acknowledgment):** O Servidor responde com as flags `SYN` e `ACK` ativas. Ele confirma o número do cliente ($X+1$) e envia o seu próprio número ($Y$).
    * *Mensagem:* "Recebi seu X. Eu também quero conectar. Meu número é Y."
3.  **ACK (Acknowledgment):** O Cliente envia um pacote final com a flag `ACK`. Ele confirma o número do servidor ($Y+1$).
    * *Mensagem:* "Recebi seu Y. Tudo pronto, vamos transmitir!"

### **Estados da Conexão (Logs de Segurança)**
* **LISTEN:** Servidor aguardando um SYN.
* **SYN_SENT:** Cliente enviou o pedido.
* **SYN_RECEIVED:** Servidor enviou o SYN-ACK e aguarda a confirmação final.
* **ESTABLISHED:** Conexão pronta para troca de dados.

---

## ⚠️ Implicações de Segurança (Resumo)

| Conceito | Risco de Segurança |
| :--- | :--- |
| **UDP** | **IP Spoofing:** Como não há handshake, é fácil falsificar a origem do pacote para ataques de reflexão (DDoS). |
| **TCP SYN** | **SYN Flood:** O atacante envia muitos SYNs e não responde ao SYN-ACK, esgotando a memória do servidor. |
| **Port Scanning** | O uso do Handshake para descobrir se portas (como 22, 80, 443) estão abertas e vulneráveis. |

