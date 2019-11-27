class PageScroll {
  private scrollRecords: Array<{ x: number, y: number }> = [];

  public setPageScroll(scrollX: number, scrollY: number) {
    this.scrollRecords.push({ x: scrollX, y: scrollY });
  }

  /**
   * Get page scroll position before n times scroll
   * @param count scroll times count
   */
  public getPageScrollPositionBeforeScroll(count: number): { x: number, y: number } {
    return this.scrollRecords.slice(
      this.scrollRecords.length - count - 1,
      this.scrollRecords.length - count
    )[0];
  }

  // TODO clear obsolete scroll records

  public clearRecords() {
    this.scrollRecords.length = 0;
  }
}

export const pageScroll = new PageScroll();