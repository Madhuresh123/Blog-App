const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/ '})
const fs = require('fs')
const PORT = process.env.PORT || 8000;


const dotenv = require('dotenv');
const Post = require('./models/Post');
dotenv.config();

const salt = bcrypt.genSaltSync(10);
const secret = 'snfwjefksefksrjngfs';

const app = express();
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'));

const dbURI = process.env.MONGO_URI;
const options = { useNewUrlParser: true, useUnifiedTopology: true };

const path = require('path')

app.get('/', (req,res) => {
  res.send("main");
})

if(process.env.NODE_ENV == "production"){
  app.use(express.static("client/my-ap/build"))
}


mongoose.connect(dbURI, options)
  .then(() => {
    console.log('Connected to the database');
    app.listen(PORT, () => {
      console.log('Server started on port 8000');
    });
  })
  .catch((err) => {
    console.log('Error connecting to the database', err);
  });

// generate JWT token
const token = jwt.sign({userId: 123}, 'secret-key', { expiresIn: '1h' });

// verify JWT token
jwt.verify(token, 'secret-key', (err, decoded) => {
    if (err) {
      // handle JWT verification error
    } else {
      // decoded contains the decoded token payload
    }
  });

app.get('/login', (req, res) => {
  res.send("login");
});

app.get('/logout', (req, res) => {
    res.send("logout");
  });



app.get('/register', (req, res) => {
  res.send("register");
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // create new user
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);

  } catch (e) {
    console.log(e);
    res.status(400).json(e);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });


  if (!userDoc) {
    return res.status(400).json({ message: 'User does not exist' });
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);

  if (passOk) {
    // create and send JWT token
    jwt.sign({ username, id: userDoc._id }, secret, (err, token) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ 
            id: userDoc._id,
            username,
         });
      }
      res.cookie('token', token).json({ message: 'Login successful' });

    });
  } else {
    res.status(400).json({ message: 'Wrong credentials' });
  }
});

app.get('/profile',(req,res) => {
    const token = req.cookies.token;
    jwt.verify(token, secret, {}, (err, info) => {
        if(err) throw err;
        res.json(info)
    })
})

app.post('/logout',(req,res) => {
    res.cookie('token', '').json({ message: 'Login successful' });
})

app.post('/post',uploadMiddleware.single('file'), async (req,res) => {
  const {originalname, path} = req.file;
  const parts = originalname.split('.')
  const ext = parts[parts.length - 1 ]
  const newPath = path+ '.'+ext
  fs.renameSync(path, newPath)

  const token = req.cookies.token;
  jwt.verify(token, secret, {}, async (err, info) => {
    if(err) throw err;
    const {title, summary, content} = req.body;
    const postDoc = await Post.create({
      title,
      summary,
      content,
      cover: newPath,
      author: info.id,
    })
    res.json(postDoc)  
     })
}) 

app.put('/post/:id', uploadMiddleware.single('file'), async(req,res) => {
  const postId = req.params.id;
  let newPath = null;
  if(req.file){
    const {originalname, path} = req.file;
    const parts = originalname.split('.')
    const ext = parts[parts.length - 1 ]
    newPath = path+ '.'+ext
    fs.renameSync(path, newPath)
  }

  const {token} = req.cookies
  jwt.verify(token, secret, {}, async (err, info) => {
    if(err) throw err;
    const {title, summary, content} = req.body;
    const postDoc = await Post.findById(postId);
    const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id)
    if(!isAuthor){
      return res.status(400).json("you're not the author")
    }
    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;
    if(newPath) {
      postDoc.cover = newPath;
    }
    await postDoc.save();
    res.json(postDoc);
  });
});

app.delete('/delete/:id', async (req, res) => {

  try {
    // Find the note to be delete and delete it
    let note = await Post.findById(req.params.id);
    if (!note) { return res.status(404).send("Not Found") }

    note = await Post.findByIdAndDelete(req.params.id)
    res.json({ "Success": "Note has been deleted", note: note });

} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}

  // const postId = req.params.id;

  // try {
  //   const { token } = req.cookies;
  //   jwt.verify(token, secret, {}, async (err, info) => {
  //     if (err) throw err;

  //     const postDoc = await Post.findById(postId);
  //     if (!postDoc) {
  //       return res.status(404).json({ message: 'Post not found' });
  //     }

  //     const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
  //     if (!isAuthor) {
  //       return res.status(403).json({ message: "You're not the author of this post" });
  //     }

  //     await postDoc.remove();
  //     res.json({ message: 'Post deleted successfully' });
  //   });
  // } catch (error) {
  //   console.error(error);
  //   res.status(500).json({ message: 'Internal server error' });
  // }
});




app.get('/post', async (req,res) => {
  res.json(
    await Post.find()
      .populate('author', ['username'])
      .sort({createdAt: -1})
      .limit(20)
  );
});

app.get('/post/:id', async (req, res) => {
  const {id} = req.params;
  const postDoc = await Post.findById(id).populate('author', ['username']);
  res.json(postDoc);
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
