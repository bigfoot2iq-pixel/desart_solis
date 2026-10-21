import {CogIcon} from '@sanity/icons/Cog'
import {CommentIcon} from '@sanity/icons/Comment'
import {InboxIcon} from '@sanity/icons/Inbox'
import type {StructureResolver} from 'sanity/structure'

export const SINGLETONS = ['siteSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Desart Solis')
    .items([
      S.listItem()
        .title('Réglages du site')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Réglages du site')),
      S.divider(),
      S.documentTypeListItem('product').title('Produits'),
      S.documentTypeListItem('pack').title('Packs'),
      S.divider(),
      S.listItem()
        .title('Avis à modérer')
        .icon(InboxIcon)
        .child(
          S.documentList()
            .title('Avis à modérer')
            .apiVersion('2026-10-17')
            .filter('_type == "review" && _id in path("drafts.**")')
            .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
        ),
      S.listItem()
        .title('Tous les avis')
        .icon(CommentIcon)
        .child(S.documentTypeList('review').title('Tous les avis').defaultOrdering([{field: 'submittedAt', direction: 'desc'}])),
      S.divider(),
      S.documentTypeListItem('faq').title('Questions fréquentes'),
    ])
