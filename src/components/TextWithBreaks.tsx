import {Fragment} from 'react';

export default function TextWithBreaks({text}: {text: string}) {
  if (!text) return null;

  return (
    <>
      {text.split('\n\n').map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph.split('\n').map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
