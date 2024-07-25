import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { logIn } from '../../utils';
import { useContext, useState } from 'react';
import { userContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@mui/material';
function Copyright() {
    return (
        <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © Dolphin Engenharia '}
           
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}
// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme();

 const SignIn = ( ) => {
    const navigate = useNavigate();
    const { toggleLogedIn } = useContext(userContext);
    const [errorLogin, setErrorLogin] = useState<boolean>(false);
    const toggleErrorLogin = ( ) => { 
        console.log('errorLogin became: ', !errorLogin)
        setErrorLogin(!errorLogin);
    }
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('email') ? data.get('email') : '';
        const responseLogin = await logIn(String(username), String(data.get('password')));
        if (responseLogin.message === 'Login Successful'){ 
            console.log('login successfull')
            window.localStorage.setItem('token', responseLogin.token);
            console.log('localStorage token: ', window.localStorage.getItem('token'));
            navigate('./home');
            toggleLogedIn(true);
        }else{ 
            toggleErrorLogin();
        }
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container component="main" maxWidth="xs">
                { 
                    errorLogin &&    <Alert variant="filled" severity="error">
                    Usuário e/ou senha incorretos
                </Alert>
                }
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Faça seu Login
                    </Typography>
                    <Box  component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Usuário"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Entrar
                        </Button>
                      
                    </Box>
                </Box>
                <Copyright />
            </Container>
        </ThemeProvider>
    );
}
export default SignIn;