import {BasketIcon} from '@sanity/icons/Basket'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const pack = defineType({
  name: 'pack',
  title: 'Pack',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nom',
      type: 'string',
      description: 'Ex. Rituel Complet',
      validation: (rule) => rule.required().max(40),
    }),
    defineField({
      name: 'description',
      title: 'Sous-titre',
      type: 'string',
      description: 'Ex. Face Wash + Gommage',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'products',
      title: 'Produits inclus',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
      validation: (rule) => rule.required().min(2).unique(),
    }),
    defineField({
      name: 'discountPercent',
      title: 'Remise (%)',
      type: 'number',
      description: 'Appliquée sur la somme des prix des produits inclus.',
      validation: (rule) => rule.required().min(0).max(80).precision(0),
    }),
    defineField({
      name: 'badge',
      title: 'Badge',
      type: 'string',
      description: 'Facultatif. Ex. Le plus choisi',
      validation: (rule) => rule.max(24),
    }),
    defineField({
      name: 'status',
      title: 'Statut',
      type: 'string',
      options: {
        list: [
          {title: 'Actif', value: 'active'},
          {title: 'Masqué', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'active',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'sortOrder', title: 'Ordre d’affichage', type: 'number', initialValue: 10}),
  ],
  preview: {
    select: {title: 'name', discount: 'discountPercent', status: 'status', media: 'products.0.image'},
    prepare: ({title, discount, status, media}) => ({
      title,
      subtitle: `−${discount ?? 0} %${status === 'hidden' ? ' · Masqué' : ''}`,
      media,
    }),
  },
})
