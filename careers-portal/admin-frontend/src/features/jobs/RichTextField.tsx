import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

interface RichTextFieldProps {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
  placeholder?: string
}

export function RichTextField({ value, onChange, disabled, placeholder }: RichTextFieldProps) {
  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">Edit</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="min-h-[160px] font-mono text-xs"
        />
      </TabsContent>
      <TabsContent value="preview">
        <div
          className="min-h-[160px] rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_h1]:mb-2 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_li]:mb-1 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_strong]:font-semibold [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5"
          dangerouslySetInnerHTML={{ __html: value || '<p class="text-muted-foreground">Nothing to preview yet.</p>' }}
        />
      </TabsContent>
    </Tabs>
  )
}
