import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Preview, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
}

const AssessmentReminder = ({ name }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Finish your FocusCheck screening when you have a few minutes</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your FocusCheck screening is waiting</Heading>
        <Text style={text}>{name ? `Hi ${name},` : 'Hi there,'}</Text>
        <Text style={text}>
          You started a FocusCheck screening but haven't finished it yet. It takes about 15 minutes and
          gives you a clear picture of your attention and focus patterns.
        </Text>
        <Button style={button} href="https://focuscheck.life/assessment">Finish my screening</Button>
        <Text style={small}>FocusCheck is a screening tool, not a diagnosis.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: AssessmentReminder,
  subject: 'Finish your FocusCheck screening',
  displayName: 'Assessment reminder',
  previewData: { name: 'Jane' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '22px', color: '#1f2937', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#374151' }
const small = { fontSize: '12px', color: '#6b7280', marginTop: '24px' }
const button = { backgroundColor: '#0477b4', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', fontSize: '15px', textDecoration: 'none' }
