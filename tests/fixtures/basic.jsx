const container = toString(<div />)

toString(<button data-help={{ key: 'value' }}>Button</button>)
toString(<>123</>)
toString(<a href="/'">Button</a>)
toString(
  <a href={`/""'\``} title={'btn'}>
    Button
  </a>
)
toString(
  <div>
    <button
      id={33 + 1}
      className={['a', 'b']}
      style={{ color: 'red', fontSize: '16px' }}
      onClick={(evt) => console.log(evt)}
    ></button>
  </div>
)

toString(<div>{}</div>)
toString(<>{/* Hello there */}</>)
toString(<div>{/* Hello there */}</div>)
