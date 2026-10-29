import {CogIcon} from '@sanity/icons/Cog'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Réglages du site',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'delivery', title: 'Livraison'},
    {name: 'hero', title: 'Accueil'},
    {name: 'content', title: 'Textes'},
  ],
  fields: [
    defineField({
      name: 'featuredPack',
      title: 'Pack mis en avant',
      type: 'reference',
      to: [{type: 'pack'}],
      group: 'hero',
      description: 'Pack affiché dans le hero avec ses produits, sa remise et son prix. À défaut, le premier pack actif est utilisé.',
      options: {filter: 'status == "active"'},
    }),
    defineField({
      name: 'whatsappNumber',
      title: 'Numéro WhatsApp des commandes',
      type: 'string',
      group: 'contact',
      description: 'Format international, sans + ni espaces. Ex. 212612213324',
      validation: (rule) => rule.required().regex(/^\d{10,15}$/, {name: 'numéro international'}),
    }),
    defineField({
      name: 'phoneDisplay',
      title: 'Téléphone affiché',
      type: 'string',
      group: 'contact',
      description: 'Ex. 06 12 21 33 24',
    }),
    defineField({name: 'instagram', title: 'Instagram (sans @)', type: 'string', group: 'contact'}),
    defineField({
      name: 'facebook',
      title: 'Page Facebook',
      type: 'string',
      group: 'contact',
      description: 'Ex. DESART.solis',
    }),
    defineField({name: 'website', title: 'Site boutique', type: 'url', group: 'contact'}),
    defineField({
      name: 'freeShippingFrom',
      title: 'Livraison offerte à partir de (DH)',
      type: 'number',
      group: 'delivery',
      description: 'Laisser vide pour désactiver la livraison offerte.',
      validation: (rule) => rule.min(0).precision(0),
    }),
    defineField({
      name: 'cities',
      title: 'Villes & frais de livraison',
      type: 'array',
      group: 'delivery',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'deliveryZone',
          title: 'Ville',
          fields: [
            defineField({name: 'city', title: 'Ville', type: 'string', validation: (rule) => rule.required()}),
            defineField({
              name: 'fee',
              title: 'Frais (DH)',
              type: 'number',
              validation: (rule) => rule.required().min(0).precision(0),
            }),
          ],
          preview: {
            select: {city: 'city', fee: 'fee'},
            prepare: ({city, fee}) => ({title: city, subtitle: `${fee ?? '?'} DH`}),
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'announcement',
      title: 'Bandeau d’annonce',
      type: 'string',
      group: 'content',
      description: 'Texte du bandeau en haut du site. Ex. Livraison partout au Maroc • Paiement à la livraison',
      validation: (rule) => rule.max(90),
    }),
  ],
  preview: {prepare: () => ({title: 'Réglages du site'})},
})
