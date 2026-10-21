import {CommentIcon} from '@sanity/icons/Comment'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Customer submissions arrive as drafts, which are not publicly readable.
 * Publishing a draft approves it; deleting it rejects it.
 */
export const review = defineType({
  name: 'review',
  title: 'Avis client',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({
      name: 'rating',
      title: 'Note',
      type: 'number',
      options: {
        list: [
          {title: '★★★★★ (5)', value: 5},
          {title: '★★★★☆ (4)', value: 4},
          {title: '★★★☆☆ (3)', value: 3},
          {title: '★★☆☆☆ (2)', value: 2},
          {title: '★☆☆☆☆ (1)', value: 1},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().min(1).max(5).integer(),
    }),
    defineField({
      name: 'author',
      title: 'Nom du client',
      type: 'string',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({name: 'city', title: 'Ville', type: 'string', validation: (rule) => rule.max(40)}),
    defineField({
      name: 'product',
      title: 'Produit',
      type: 'reference',
      to: [{type: 'product'}],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'title', title: 'Titre', type: 'string', validation: (rule) => rule.max(80)}),
    defineField({
      name: 'body',
      title: 'Avis',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required().min(10).max(1500),
    }),
    defineField({
      name: 'media',
      title: 'Photos & vidéos',
      type: 'array',
      of: [
        defineArrayMember({type: 'image', title: 'Photo', options: {hotspot: true}}),
        defineArrayMember({
          type: 'file',
          name: 'video',
          title: 'Vidéo',
          options: {accept: 'video/mp4,video/webm,video/quicktime'},
        }),
      ],
      validation: (rule) => rule.max(6),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Date de l’avis',
      type: 'date',
      options: {dateFormat: 'DD/MM/YYYY'},
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verification',
      title: 'Achat',
      type: 'string',
      description: 'Choisissez « Acheteur vérifié » uniquement si la commande a été retrouvée.',
      options: {
        list: [
          {title: 'Acheteur vérifié', value: 'verified'},
          {title: 'Non vérifié', value: 'unverified'},
        ],
        layout: 'radio',
      },
      initialValue: 'unverified',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reply',
      title: 'Réponse de Desart Solis',
      type: 'text',
      rows: 3,
      description: 'Facultatif. Affichée sous l’avis.',
    }),
    defineField({
      name: 'helpfulCount',
      title: 'Votes « utile »',
      type: 'number',
      description: 'Compté automatiquement depuis le site.',
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: 'source',
      title: 'Origine',
      type: 'string',
      readOnly: true,
      options: {
        list: [
          {title: 'Formulaire du site', value: 'website'},
          {title: 'Ajouté par l’équipe', value: 'admin'},
        ],
      },
      initialValue: 'admin',
    }),
  ],
  orderings: [{title: 'Plus récents', name: 'recent', by: [{field: 'submittedAt', direction: 'desc'}]}],
  preview: {
    select: {
      author: 'author',
      rating: 'rating',
      title: 'title',
      body: 'body',
      product: 'product.name',
      media: 'media.0',
    },
    prepare: ({author, rating, title, body, product, media}) => ({
      title: `${'★'.repeat(rating ?? 0)} ${author ?? 'Anonyme'}`,
      subtitle: [product, title || (body ? String(body).slice(0, 60) : null)].filter(Boolean).join(' — '),
      media: media?._type === 'image' ? media : CommentIcon,
    }),
  },
})
