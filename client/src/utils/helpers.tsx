const helpers = {
  extractTruffleErrorMessage(error: Error): string {

    let message: string = '';
    try {
      let errorMessageInJson = JSON.parse(
        error.message.slice(58, error.message.length - 2)
      );
      message = errorMessageInJson.data
        .data[Object.keys(errorMessageInJson.data.data)[0]]
        .reason;
    }
    catch { message = 'unable to determine reason'; }

    return message;
  }
}

export default helpers;
