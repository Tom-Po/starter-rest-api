const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')
const cors = require('cors')

app.use(cors({
  origin: '*'
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async function getItems(col) {
  const { results: resultsMetaData } = await db.collection(col).list();
  const items = await Promise.all(
    resultsMetaData.map(async ({ key }) => {
      const item = (await db.collection(col).get(key)).props
      return {
        ...item,
        id: key
      };
    })
  );
  return items;
}

async function addItem(col, body) {
  let key = 0;
  const lastest = await db.collection(col).latest();
  if (lastest) {
    key = parseInt(lastest.key) + 1
  }
  const item = await db.collection(col).set(key.toString(), body)
  return item;
}
// All post
// POst todos
app.post('/todos', async (req, res) => {
  const item = await addItem("todos", req.body)
  res.json(item).end()
})
// post seeds
app.post('/seeds', async (req, res) => {
  const item = await addItem("seeds", req.body)
  res.json(item).end()
})

// Delete an item
// Todo
app.delete('/todos/:key', async (req, res) => {
  const key = req.params.key
  const item = await db.collection("todos").delete(key)
  res.json(item).end()
})
// Seeds
app.delete('/seeds/:key', async (req, res) => {
  const key = req.params.key
  const item = await db.collection("seeds").delete(key)
  res.json(item).end()
})

// Get all  items
// All todos
app.get('/todos', async (req, res) => {
  const col = "todos"
  const todos = await getItems(col)
  res.send(todos);
})
// All seeds
app.get('/seeds', async (req, res) => {
  const col = "seeds"
  const seeds = await getItems(col)
  res.send(seeds);
})


// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
