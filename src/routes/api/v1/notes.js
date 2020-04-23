import { Router } from 'express'
import db from 'models'

const router = new Router()

router.put('/:noteId', async (req, res) => {
  const { noteId } = req.params
  await db.Note.update(
    {
      content: req.body.content
    },
    {
      where: { id: noteId }
    }
  )
  const note = await db.Note.findByPk(noteId)
  if (!note) return res.status(404).send('Can not find note')
  return res.json(note)
})

export default router
