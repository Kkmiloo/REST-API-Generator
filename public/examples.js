const mainDiv = document.querySelector('#examples');
const apiBtn = document.querySelector('#api-btn');

const examples = [
  {
    title: 'Example 1',
    description: 'Example 1 description',
    link: 'example1.html',
  },
  {
    title: 'Example 2',
    description: 'Example 2 description',
    link: 'example2.html',
  },
];

mainDiv.append(JSON.stringify(examples));

apiBtn.addEventListener('click', (e) => {
  e.preventDefault();

  const data = {
    api_name: 'Test',
    data: examples,
  };

  fetch('/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
    })
    .catch((e) => console.error(e));
});
