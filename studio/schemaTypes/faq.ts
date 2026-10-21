import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {defineField, defineType} from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'Question fréquente',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      validation: (rule) => rule.required().max(140),
    }),
    defineField({
      name: 'answer',
      title: 'Réponse',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(800),
    }),
    defineField({name: 'sortOrder', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  orderings: [{title: 'Ordre d’affichage', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})
