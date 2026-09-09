import { TextField, Button } from '@mui/material'

const LoginForm = ({ username, setUsername, password, setPassword, handleLogin }) => {

  return (
    <div>
      <h2>log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          <TextField label="username" value={username} onChange={({ target }) => setUsername(target.value)} variant='standard' style={{ marginTop: 10 }} />
        </div>
        <div>
          <TextField label="password" type='password' value={password} onChange={({ target }) => setPassword(target.value)} variant='standard' style={{ marginTop: 10 }} />
        </div>
        <Button type='submit' variant='contained' style={{ marginTop: 10 }}>login</Button>
      </form>
    </div>
  )
}

export default LoginForm