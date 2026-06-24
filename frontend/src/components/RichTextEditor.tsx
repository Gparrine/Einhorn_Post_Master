import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string, plainText: string) => void
  onRefine: () => void
  isRefining: boolean
}

export default function RichTextEditor({ content, onChange, onRefine, isRefining }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Write your post here…' }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML(), ed.getText())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false })
    }
  }, [content, editor])

  if (!editor) return null

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <u>U</u>
          </button>
          <span className="toolbar-sep" />
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            •≡
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            1.
          </button>
          <span className="toolbar-sep" />
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            title="Align left"
          >
            ⫷
          </button>
          <button
            type="button"
            className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            title="Align center"
          >
            ≡
          </button>
        </div>

        <button
          type="button"
          className="refine-btn"
          onClick={onRefine}
          disabled={isRefining}
        >
          {isRefining ? (
            <>
              <span className="spinner small" />
              Refining…
            </>
          ) : (
            <>✨ Refine with AI</>
          )}
        </button>
      </div>

      <div className="editor-content">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
