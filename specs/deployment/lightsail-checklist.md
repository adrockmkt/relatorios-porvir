# Checklist Lightsail

## DNS

- criar subdominio `relatorios.porvir.org`
- apontar registro A para IP publico da instancia
- aguardar propagacao

## Servidor

- atualizar pacotes
- instalar Node.js LTS
- instalar PostgreSQL
- instalar Nginx
- instalar Certbot

## Aplicacao

- clonar repo
- configurar `.env`
- instalar dependencias
- rodar schema/migracoes
- buildar frontend
- configurar systemd da API
- configurar Nginx

## HTTPS

- emitir certificado para `relatorios.porvir.org`
- ativar redirect HTTP para HTTPS
- testar renovacao automatica

## Banco

- criar database
- criar usuario da aplicacao
- restringir acesso local
- testar backup

## Validacao

- abrir pagina inicial
- criar admin inicial
- cadastrar cliente Porvir
- cadastrar usuario viewer
- publicar relatorio teste
- acessar como viewer
- abrir link externo

## Operacao

- configurar logs
- configurar backup diario
- documentar credenciais em local seguro
- registrar procedimento de rollback
