class PageSize {
  private sizeRecords: Array<{ w: number, h: number }> = [];

  public setPageSize(w: number, h: number) {
    this.sizeRecords.push({ w, h });
  }

  /**
   * Get page size before n times resize
   * @param count resize times count
   */
  public getPageSizeBeforeResize(count: number): { w: number, h: number } {
    return this.sizeRecords.slice(
      this.sizeRecords.length - count - 1,
      this.sizeRecords.length - count
    )[0];
  }

  // TODO clear obsolete scroll records

  public clearRecords() {
    this.sizeRecords.length = 0;
  }
}

export const pageSize = new PageSize();