# videochat-webrtc-js
 
 --------------------------------------------------------
 
 ## Sobre:
 Projeto visado em criar sala de video virtual no navegador, web o mobile.
 
 
 ![image](https://user-images.githubusercontent.com/60331806/87492610-4b6ee280-c621-11ea-990e-0ad0650ed471.png)

## Tecnologias
- Html
- Css 
- Javascript
- WEbRTC
- ScaleDrone

### Se necessário, trocar a porta urls para configurar o iceServers:
```
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.l.google.com:19302'
        }
    ]
}

```

### Como contribuir?

- Faça um fork desse repositório;
- Cria uma branch com a sua feature: git checkout -b minha-feature;
- Faça commit das suas alterações: git commit -m 'feat: Minha nova feature';
- Faça push para a sua branch: git push origin minha-feature.

### Obs:
- O projeto foi publicado em http://chatvideo.surge.sh, porém só está funcionando como desenvolvimento. 
Algumas configurações precisão ser ajustadas para que funcione em produção.
