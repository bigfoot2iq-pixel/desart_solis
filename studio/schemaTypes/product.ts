import {PackageIcon} from '@sanity/icons/Package'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({name: 'name', title: 'Nom', type: 'string', validation: (rule) => rule.required().max(60)}),
    defineField({
      name: 'slug',
      title: 'Identifiant',
      type: 'slug',
      description: 'Généré à partir du nom. Ne pas modifier après la mise en ligne.',
      options: {source: 'name', maxLength: 60},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Prix (DH)',
      type: 'number',
      validation: (rule) => rule.required().min(0).precision(0),
    }),
    defineField({
      name: 'size',
      title: 'Contenance',
      type: 'string',
      description: 'Ex. 200 ml, 250 g',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Photo produit',
      type: 'image',
      description: 'PNG ou WebP avec fond transparent, produit seul et bien cadré.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Texte alternatif',
          type: 'string',
          validation: (rule) => rule.required().warning('Décrivez la photo pour l’accessibilité et le SEO'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'string',
      options: {
        list: [
          {title: 'Visage', value: 'visage'},
          {title: 'Cheveux', value: 'cheveux'},
          {title: 'Barbe', value: 'barbe'},
          {title: 'Corps', value: 'corps'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Accroche',
      type: 'string',
      description: 'Ex. Gel nettoyant hydratant',
      validation: (rule) => rule.max(60),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().max(400),
    }),
    defineField({
      name: 'notes',
      title: 'Points clés',
      description: 'Ingrédients ou bénéfices affichés en étiquettes (3 conseillés).',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'availability',
      title: 'Disponibilité',
      type: 'string',
      options: {
        list: [
          {title: 'En vente', value: 'available'},
          {title: 'Rupture de stock', value: 'soldOut'},
          {title: 'Masqué du site', value: 'hidden'},
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Ordre d’affichage',
      type: 'number',
      description: 'Les plus petits numéros s’affichent en premier.',
      initialValue: 10,
    }),
  ],
  orderings: [{title: 'Ordre d’affichage', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', price: 'price', size: 'size', media: 'image', availability: 'availability'},
    prepare: ({title, price, size, media, availability}) => ({
      title,
      subtitle: [
        size,
        price != null ? `${price} DH` : null,
        availability === 'soldOut' ? 'Rupture' : availability === 'hidden' ? 'Masqué' : null,
      ]
        .filter(Boolean)
        .join(' · '),
      media,
    }),
  },
})
