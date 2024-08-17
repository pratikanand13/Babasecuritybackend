function storeLinksAndData(inputString) {
  const result = {
      links: [],
      data: []
  };

  // Split the input string into lines
  const lines = inputString.split('\n');

  // Iterate over each line
  lines.forEach(line => {
      // Trim any white space
      line = line.trim();

      // Check if the line contains a URL or base64 data
      if (line.startsWith('https://')) {
          result.links.push(line);
      } else if (line.startsWith('data:application/x-javascript;')) {
          result.data.push(line);
      }
  });

  // Example usage of storing result under a key called 'links'
  const storageObject = { links: result };
  console.log(storageObject);

  return storageObject;
}

// Example input string (you would replace this with the actual content)
const exampleInput = `
data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCnZhciBkYXRhRWxlbWVudD1kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgiZW52anNvbiIpO2lmKGRhdGFFbGVtZW50IT1udWxsKXt2YXIgY29weVZhcmlhYmxlcz1mdW5jdGlvbihhKXtmb3IodmFyIGIgaW4gdmFyaWFibGVzKWFbYl09dmFyaWFibGVzW2JdfSx2YXJpYWJsZXM9SlNPTi5wYXJzZShkYXRhRWxlbWVudC50ZXh0Q29udGVudCk7d2luZG93LnJlcXVpcmVMYXp5P3dpbmRvdy5yZXF1aXJlTGF6eShbIkVudiJdLGNvcHlWYXJpYWJsZXMpOih3aW5kb3cuRW52PXdpbmRvdy5FbnZ8fHt9LGNvcHlWYXJpYWJsZXMod2luZG93LkVudikpfQovLyMgc291cmNlVVJMPWh0dHBzOi8vc3RhdGljLndoYXRzYXBwLm5ldC9yc3JjLnBocC92My95TC9yL2RiZ3JNc25EMThwLmpzP19uY194PUlqM1dwOGxnNUt6Cg==
data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCl9fYW5ub3RhdG9yPWZ1bmN0aW9uKGEpe3JldHVybiBhfSxfX2Rfc3R1Yj1bXSxfX2Q9ZnVuY3Rpb24oYSxiLGMsZCl7X19kX3N0dWIucHVzaChbYSxiLGMsZF0pfSxfX3JsX3N0dWI9W10scmVxdWlyZUxhenk9ZnVuY3Rpb24oKXtfX3JsX3N0dWIucHVzaChhcmd1bWVudHMpfTsKLy8jIHNvdXJjZVVSTD1odHRwczovL3N0YXRpYy53aGF0c2FwcC5uZXQvcnNyYy5waHAvdjMveTIvci9jTWRfU1pvdjlFaS5qcz9fbmNfeD1JajNXcDhsZzVLego=
data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCl9idGxkcj17fTsKLy8jIHNvdXJjZVVSTD1odHRwczovL3N0YXRpYy53aGF0c2FwcC5uZXQvcnNyYy5waHAvdjMveUgvci9aTGNLT2JOdU8xYi5qcz9fbmNfeD1JajNXcDhsZzVLego=
data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCmZ1bmN0aW9uIHBhcmVudElzTm90SGVhZE5vckJvZHkoYSl7cmV0dXJuIGEucGFyZW50RWxlbWVudCE9PWRvY3VtZW50LmJvZHkmJmEucGFyZW50RWxlbWVudCE9PWRvY3VtZW50LmhlYWR9ZnVuY3Rpb24gaXNUYWdTdXBwb3J0ZWQoYSl7cmV0dXJuIGEubm9kZU5hbWU9PT0iU0NSSVBUInx8YS5ub2RlTmFtZT09PSJMSU5LIiYmKChhPWdldE5vZGVEYXRhU2V0KGEpKT09bnVsbD92b2lkIDA6YS5hc3luY0Nzcyl9ZnVuY3Rpb24gZ2V0Tm9kZURhdGFTZXQoYSl7cmV0dXJuIShhLmRhdGFzZXQgaW5zdGFuY2VvZiB3aW5kb3cuRE9NU3RyaW5nTWFwKT9udWxsOmEuZGF0YXNldH1mdW5jdGlvbiBhZGRMb2FkRXZlbnRMaXN0ZW5lcnMoYSl7dmFyIGI7dHJ5e2lmKGEubm9kZVR5cGUhPT1Ob2RlLkVMRU1FTlRfTk9ERSlyZXR1cm59Y2F0Y2goYSl7cmV0dXJufWlmKHBhcmVudElzTm90SGVhZE5vckJvZHkoYSl8fCFpc1RhZ1N1cHBvcnRlZChhKSlyZXR1cm47dmFyIGM9KGI9Z2V0Tm9kZURhdGFTZXQoYSkpPT1udWxsP3ZvaWQgMDpiLmJvb3Rsb2FkZXJIYXNoO2lmKGMhPW51bGwmJmMhPT0iIil7dmFyIGQ9bnVsbCxlPWZ1bmN0aW9uKCl7d2luZG93Ll9idGxkcltjXT0xLGQ9PW51bGw/dm9pZCAwOmQoKX07ZD1mdW5jdGlvbigpe2EucmVtb3ZlRXZlbnRMaXN0ZW5lcigibG9hZCIsZSksYS5yZW1vdmVFdmVudExpc3RlbmVyKCJlcnJvciIsZSl9O2EuYWRkRXZlbnRMaXN0ZW5lcigibG9hZCIsZSk7YS5hZGRFdmVudExpc3RlbmVyKCJlcnJvciIsZSl9fShmdW5jdGlvbigpe0FycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0LGxpbmtbZGF0YS1hc3luYy1jc3M9IjEiXScpKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3JldHVybiBhZGRMb2FkRXZlbnRMaXN0ZW5lcnMoYSl9KTt2YXIgYT1uZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbihhLGIpe2EuZm9yRWFjaChmdW5jdGlvbihhKXthLnR5cGU9PT0iY2hpbGRMaXN0IiYmQXJyYXkuZnJvbShhLmFkZGVkTm9kZXMpLmZvckVhY2goZnVuY3Rpb24oYSl7YWRkTG9hZEV2ZW50TGlzdGVuZXJzKGEpfSl9KX0pO2Eub2JzZXJ2ZShkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgiaHRtbCIpWzBdLHthdHRyaWJ1dGVzOiExLGNoaWxkTGlzdDohMCxzdWJ0cmVlOiEwfSl9KSgpOwovLyMgc291cmNlVVJMPWh0dHBzOi8vc3RhdGljLndoYXRzYXBwLm5ldC9yc3JjLnBocC92My95dS9yL2VtbUZmRnNUVXRELmpzP19uY194PUlqM1dwOGxnNUt6Cg==
data:application/x-javascript; charset=utf-8;base64,Oy8qRkJfUEtHX0RFTElNKi8KCiJ1c2Ugc3RyaWN0Ijt0cnl7dmFyIFRIRU1FX0tFWT0idGhlbWUiLFNZU1RFTV9USEVNRV9NT0RFPSJzeXN0ZW0tdGhlbWUtbW9kZSIsc3BsYXNoc2NyZWVuVmFyaWFibGVNYXA9eyItLXNwbGFzaHNjcmVlbi1zdGFydHVwLWJhY2tncm91bmQiOntsaWdodDoiI2YwZjJmNSIsZGFyazoiIzExMWIyMSJ9LCItLXNwbGFzaHNjcmVlbi1zdGFydHVwLWJhY2tncm91bmQtcmdiIjp7bGlnaHQ6IjI0MCwgMjQyLCAyNDUiLGRhcms6IjE3LCAyNywgMzMifSwiLS1zcGxhc2hzY3JlZW4tc3RhcnR1cC1pY29uIjp7bGlnaHQ6IiNiYmM1Y2IiLGRhcms6IiM2NzZmNzMifSwiLS1zcGxhc2hzY3JlZW4tcHJpbWFyeS10aXRsZSI6e2xpZ2h0OiIjNDEyNWQiLGRhcms6InJnYmEoMjMzLCAyMzcsIDIzOSwgMC44OCkifSwiLS1zcGxhc2hzY3JlZW4tc2Vjb25kYXJ5LWxpZ2h0ZXIiOntsaWdodDoiIzg2OTZhMCIsZGFyazoiIzY2Nzc4MSJ9LCItLXNwbGFzaHNjcmVlbi1wcm9ncmVzcy1wcmltYXJ5Ijp7bGlnaHQ6IiMwMGMyOTgiLGRhcms6IiMwYjg0NmQifSwiLS1zcGxhc2hzY3JlZW4tcHJvZ3Jlc3MtYmFja2dyb3VuZCI6e2xpZ2h0OiIjZTllZGVmIixkYXJrOiIjMjMzMTM4In19LHByZWZlcnNDb2xvclNjaGVtZU1vZGU9bnVsbDtpZih3aW5kb3cubWF0Y2hNZWRpYSl7dmFyIHByZWZlcnNEYXJrPXdpbmRvdy5tYXRjaE1lZGlhKCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGRhcmspIikscHJlZmVyc0xpZ2h0PXdpbmRvdy5tYXRjaE1lZGlhKCIocHJlZmVycy1jb2xvci1zY2hlbWU6IGxpZ2h0KSIpO3ByZWZlcnNEYXJrLm1hdGNoZXM9PT0hMD9wcmVmZXJzQ29sb3JTY2hlbWVNb2RlPSJkYXJrIjpwcmVmZXJzTGlnaHQubWF0Y2hlcyYmKHByZWZlcnNDb2xvclNjaGVtZU1vZGU9ImxpZ2h0Iil9dmFyIHN5c3RlbVRoZW1lTW9kZVNldD13aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oU1lTVEVNX1RIRU1FX01PREUpPT09InRydWUiLGNvbmZpZ3VyZWRUaGVtZT13aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oVEhFTUVfS0VZKTtzeXN0ZW1UaGVtZU1vZGVTZXQ/cHJlZmVyc0NvbG9yU2NoZW1lTW9kZT09PSJkYXJrIj9PYmplY3Qua2V5cyhzcGxhc2hzY3JlZW5WYXJpYWJsZU1hcCkuZm9yRWFjaChmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4oYj1kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpPT1udWxsP3ZvaWQgMDpiLnN0eWxlLnNldFByb3BlcnR5KGEsc3BsYXNoc2NyZWVuVmFyaWFibGVNYXBbYV0uZGFyayl9KTpwcmVmZXJzQ29sb3JTY2hlbWVNb2RlPT09ImxpZ2h0IiYmT2JqZWN0LmtleXMoc3BsYXNoc2NyZWVuVmFyaWFibGVNYXApLmZvckVhY2goZnVuY3Rpb24oYSl7dmFyIGI7cmV0dXJuKGI9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KT09bnVsbD92b2lkIDA6Yi5zdHlsZS5zZXRQcm9wZXJ0eShhLHNwbGFzaHNjcmVlblZhcmlhYmxlTWFwW2FdLmxpZ2h0KX0pOmNvbmZpZ3VyZWRUaGVtZT09PSciZGFyayInP09iamVjdC5rZXlzKHNwbGFzaHNjcmVlblZhcmlhYmxlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3ZhciBiO3JldHVybihiPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk9PW51bGw/dm9pZCAwOmIuc3R5bGUuc2V0UHJvcGVydHkoYSxzcGxhc2hzY3JlZW5WYXJpYWJsZU1hcFthXS5kYXJrKX0pOihjb25maWd1cmVkVGhlbWU9PW51bGx8fGNvbmZpZ3VyZWRUaGVtZT09PScibGlnaHQiJykmJk9iamVjdC5rZXlzKHNwbGFzaHNjcmVlblZhcmlhYmxlTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGEpe3ZhciBiO3JldHVybihiPWRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk9PW51bGw/dm9pZCAwOmIuc3R5bGUuc2V0UHJvcGVydHkoYSxzcGxhc2hzY3JlZW5WYXJpYWJsZU1hcFthXS5saWdodCl9KX1jYXRjaChhKXt9Ci8vIyBzb3VyY2VVUkw9aHR0cHM6Ly9zdGF0aWMud2hhdHNhcHAubmV0L3JzcmMucGhwL3YzL3lQL3IvZ2NvMUJrcHp6eFIuanM/X25jX3g9SWozV3A4bGc1S3oK
https://static.whatsapp.net/rsrc.php/v3/yE/r/nb9ZPFmvE91.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3/yv/r/N_0xuVPVy6B.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3iMrv4/yU/l/rt/q7EPlk4tllw.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3/yx/r/ryQSgyNOW8X.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3/yB/r/rKKWi6UFlErvsWqehdEtWw.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3iJwZ4/yh/l/rt/kMQfjcf2Wll.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3/yu/r/S0gMIb4CjKl.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3iHCc4/y1/l/rt/3mGC4I_V723.js?_nc_x=Ij3Wp8lg5Kz
https://static.whatsapp.net/rsrc.php/v3iPGz4/ye/l/rt/OzaQIqP8evz.js?_nc_x=Ij3Wp8lg5Kz
`;

// Call the function with the example input
storeLinksAndData(exampleInput);