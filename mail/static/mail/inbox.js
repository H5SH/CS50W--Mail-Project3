document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);


  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#compose-form').addEventListener('submit', () => send_email());
});

function send_email(){

    // Submit mail
  //   fetch('/emails', {
  //     method: 'POST',
  //     body: JSON.stringify({
  //         recipients: document.querySelector('#compose-recipients').value,
  //         subject: document.querySelector('#compose-subject').value,
  //         body: document.querySelector('#compose-body').value
  //     })
  //   })
  //   .then(response => response.json())
  //   .then(result => {
  //     // Print result
  //     console.log(result);
  //     load_mailbox('sent');
  //   })
  // }

  fetch('/emails',{
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });

}


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // show single mail
  document.querySelector('#mail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  //document.querySelector('#mail-view').style.display = 'none';
  
  // document.querySelector('h3').remove();
  // const h = document.createElement('h3');
  // h.innerHTML = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);
  // document.querySelector('#emails-view').append(h);
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(element => {
      const div = document.createElement('div');
      if (mailbox === 'sent')
      {
        div.innerHTML = `<strong>To: </strong>${element.recipients}<br><strong>Subject: </strong>${element.subject}<br>${element.timestamp}<hr>`;
      }
      else{
        div.innerHTML = `<strong>From: </strong>${element.sender}<br><strong>Subject: </strong>${element.subject}<br>${element.timestamp}<hr>`;
      }
  
      if (element.read != true)
      {
        div.style.backgroudcolor = 'white';
      }
      else{
        div.style.backgroundColor = '#E5E4E2';
      }
      div.addEventListener('click', ()=>{
        //make all orther divs none except the single mailview
        document.querySelector('#compose-view').style.display = 'none';
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#mail-view').style.display = 'block';
        // clear single mail div from previous mails
        document.querySelector('#mail-view').innerHTML = '';

        fetch(`/emails/${element.id}`,{
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        });
        // mail display 
        const mail_div = document.createElement('div');
        mail_div.innerHTML = `<strong>${element.recipients}</strong><h3>${element.subject}</h3><br><p>${element.body}</p>`;
        document.querySelector('#mail-view').append(mail_div);
        // button display
        if (mailbox != 'sent')
        {
          const reply_button = document.createElement('button');
          reply_button.style.width = '100px';
          reply_button.style.height = '50px';
          reply_button.style.borderRadius = '10px'
          reply_button.innerHTML = 'Reply';
          document.querySelector('#mail-view').append(reply_button);

          // onclicking the reply button
          reply_button.addEventListener('click', ()=> {
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#mail-view').style.display = 'none';
            document.querySelector('#compose-view').style.display= 'block';

            document.querySelector('#compose-recipients').value = element.sender;
            // will not add re if its already a reply
            if (element.subject.indexOf('Re') > -1)
            {
              document.querySelector('#compose-subject').value = element.subject;
            }
            else{
              document.querySelector('#compose-subject').value = `Re: ${element.subject}`;
            }

            document.querySelector('#compose-body').value = `On ${element.timestamp} ${element.recipients} wrote: ${element.body}`;
            
          });

          const archived_button = document.createElement('button');
          archived_button.style.width = '100px';
          archived_button.style.height = '50px';
          archived_button.style.borderRadius = '10px'
          if (element.archived != true)
          {
            archived_button.innerHTML = 'Archive';
          }
          else{
            archived_button.innerHTML = 'Unarchived'
          }

          archived_button.addEventListener('click',()=>{
          // archive the ail and changes the button
          if (archived_button.innerHTML === 'Archive')
          {
            archived_button.innerHTML = 'Unarchive';
            fetch(`/emails/${element.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                archived: true
              })
            });
          }
          else {
            archived_button.innerHTML = 'Archive';
            fetch(`/emails/${element.id}`,{
              method: 'PUT',
              body: JSON.stringify({
                archived: false
              })
            });
          }
        });
        document.querySelector('#mail-view').append(archived_button);
      }
        
        // appends button and sigle mail div
      
      })
      document.querySelector('#emails-view').append(div);
      // document.querySelector('#emails-views').innerHTML = `<div><strong>From:</strong>${element.sender}</div>
      // <div><strong>To:<strong>${element.recipients}</div>
      // <div><strong>Subject:</strong>${element.subject}</div>`;
      // const p = document.createElement('p');
      // p.innerHTML = element.recipients;
      // document.querySelector('#emails-view').append(p);
      
    });
  })
  .catch(error => {
    console.log('Error:', error);
  })
}
