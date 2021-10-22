export class Sse {
    constructor() {
      const eventSource = new EventSource('http://localhost:4000/stream/uuid');

      this.uuid = 0;
      
      eventSource.onopen = () => {
        console.log('connected');
      };

      eventSource.addEventListener('open', () => console.log('connected'));

      eventSource.onerror = event => {
        console.log(event);
        if (eventSource.readyState === EventSource.CLOSED) {
          /* Traitement en cas de perte de connexion définitif avec le serveur */
        }
        if (eventSource.readyState === EventSource.CONNECTING) {
          /* En cas de perte de connexion temporaire avec le serveur */
        }
      };

      eventSource.onmessage = event => {
        console.log(event.data);
      };

      eventSource.addEventListener('uuid', event => {
        console.log('Votre UUID :', event.data);

        this.uuid = event.data
      });
       
    }

    returnUuid() {
      return this.uuid;
    }
}
