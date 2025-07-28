# Glossário

Este documento inclui o glossário com os termos importantes para o negócio do projeto.

Este é um documento dinâmico, pelo que será constantemente atualizado durante cada *Sprint*.
Para efeitos de organização, a lista de termos foi ordenada pelos prefixos dos agregados:

**ST:** Estudante  
**TE:** Professor  
**TM:** Equipa  
**NW:** NotíciaAdicionada  
**WP:** ModeloPáginaWeb  
**PC:** ModeloPodcast

**Nota:** Cada termo sem qualquer prefixo assume-se que não faz parte de nenhum agregado e, portanto, faz parte de um **Serviço** ou **Conceito Genérico**.

---

## Estudante, Professor e Equipa
| Expressão         | Significado                                                                                                         |
|-------------------|---------------------------------------------------------------------------------------------------------------------|
| (ST) Estudante    | A entidade **Estudante** representa um utilizador inscrito numa equipa que pode submeter conteúdos (notícias: páginas web ou podcasts). |
| (ST) Nome_Estudante | O nome completo do estudante, frequentemente apresentado **como autor** do conteúdo.                              |
| (TE) Professor    | A entidade **Professor** representa um utilizador que supervisiona estudantes e pode estar associado a várias equipas. |
| (TM) Equipa       | A **Equipa** é um grupo de estudantes a trabalhar em conjunto, possivelmente sob a supervisão de um professor.      |

## Notícia/Adicionar
| Expressão                    | Significado                                                                                                               |
|------------------------------|--------------------------------------------------------------------------------------------------------------------------|
| **(NW) Categoria**           | Cada notícia tem a sua própria categoria associada: Para já, apenas Problemas Ambientais de Boas Práticas são possíveis. |
| **(NW) NotíciaAdicionada**   | A entidade **NotíciaAdicionada** representa uma notícia submetida que pode ser validada e publicada.                     |
| **(NW) estado_validação**    | Um **value object** que indica se uma notícia está validada, pendente ou rejeitada.                                      |
| **(NW) validador**           | O utilizador ou ator responsável por validar uma notícia.                                                                |
| **(NW) Estado_Atual**        | Um **value object** que indica o estado atual no fluxo de trabalho da notícia.                                           |
| **(NW) Comentário_FeedBack** | Comentário textual fornecido pelo validador a explicar a decisão.                                                        |
| **(NW) Designação_Estado**   | Um **enum** que descreve os possíveis estados (ex: pendente, validada, rejeitada).                                       |
| **(NW) Registo**             | Um **registo de log** das transições de estado com os campos: `data`, `estado_inicial`, `estado_final`, `estado_atual`, `utilizador`. |

## ModeloPáginaWeb
| Expressão                   | Significado                                                        |
|-----------------------------|--------------------------------------------------------------------|
| **(WP) ModeloPáginaWeb**    | Uma **entidade modelo** para estruturar notícias em formato de página web. |
| **(WP) Título**             | O título da notícia em formato de página web.                      |
| **(WP) Corpo_Texto**        | O corpo principal do texto da notícia.                             |
| **(WP) Vídeo**              | Ficheiro de vídeo opcional incluído na página web da notícia.       |
| **(WP) Imagem**             | Ficheiro de imagem opcional incluído na página web da notícia.      |
| **(WP) Secção_Comentários** | Secção que permite aos leitores deixar comentários na página web.   |

## ModeloPodcast
| Expressão                   | Significado                                                                                   |
|-----------------------------|----------------------------------------------------------------------------------------------|
| **(PC) ModeloPodcast**      | Uma **entidade modelo** para estruturar notícias em formato de podcast.                      |
| **(PC) Introdução**         | O segmento de abertura do podcast.                                                           |
| **(PC) Desenvolvimento**    | A discussão principal ou corpo do episódio do podcast.                                       |
| **(PC) Conclusão**          | O resumo final ou mensagem de encerramento do podcast.                                       |
| **(PC) Tipo**               | Um **enum** que identifica o tipo de podcast (ex: entrevista, narrativo, debate).            |


## Máquina de Estados:

O seguinte glossário tem uma descrição para todos os Estados indicados

| Expressão                   | Significado                                                                                   |
|-----------------------------|----------------------------------------------------------------------------------------------|
| **(PC) ModeloPodcast**      | Uma **entidade modelo** para estruturar notícias em formato de podcast.                      |
| **(PC) Introdução**         | O segmento de abertura do podcast.                                                           |
| **(PC) Desenvolvimento**    | A discussão principal ou corpo do episódio do podcast.                                       |
| **(PC) Conclusão**          | O resumo final ou mensagem de encerramento do podcast.                                       |
| **(PC) Tipo**               | Um **enum** que identifica o tipo de podcast (ex: entrevista, narrativo, debate).            |

## Termos Genéricos

| Expressão           | Significado                                                                       |
|---------------------|-----------------------------------------------------------------------------------|
| Critérios de Aceitação | Condições que uma funcionalidade, produto ou característica deve cumprir para ser aceite. |
| Administrador       | Ator responsável pela gestão de utilizadores e definições do sistema.             |
| Estudante           |                                                                                   |
| Professor           |                                                                                   |
| Colaborador         | Não definido para já                                                              |
| Adicionar/Novo      | Ação de criar novas entidades ou conteúdos.                                       |
| Backlog             | Lista de tarefas ou funcionalidades definidas para conclusão ou desenvolvimento.  |
| User Stories        | Descrições curtas de funcionalidades na perspetiva do utilizador/cliente.         |
****

**Nota 2:**
- Se um termo for um **Value Object**, será especificado como **um/uma** (ex: *uma caneta*).
- Se for uma **Entidade**, será especificado como **o/a** (ex: *o Livro*) no glossário.  
